import { NextRequest, after } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { getMedia, setCaption } from "@/lib/db/repo/media";
import { bumpUsage, getDailyUsage, getGlobalUsage } from "@/lib/db/repo/usage";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { sendMessage } from "@/lib/chat/sendMessage";
import { TIER1 } from "@/lib/safety/keywords";
import { jsonError, requireSession } from "@/lib/util/http";
import { ndjsonStream } from "@/lib/util/ndjson";
import { rateLimitEnforced } from "@/lib/util/rateLimit";
import { localParts } from "@/lib/time/local";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({
  clientId: z.string().min(1).max(80),
  text: z.string().max(4000).default(""),
  mediaIds: z.array(z.string().uuid()).max(6).default([]),
  kind: z.enum(["text", "voice"]).default("text"),
});

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input", parsed.error.message);
  const { clientId, text, mediaIds, kind } = parsed.data;
  // A voice note is text-only and must carry words; a text turn needs words or a photo.
  if (kind === "voice" ? !text.trim() : !text.trim() && mediaIds.length === 0) return jsonError(400, "empty");
  const effectiveMedia = kind === "voice" ? [] : mediaIds;

  const userId = s.session.userId;

  // Limit per authenticated user (not per shared IP) — but a life-safety message
  // must never be turned away with a 429 before it reaches the crisis pipeline,
  // so a deterministic tier-1 keyword hit is exempt from the limit.
  const crisisExempt = TIER1.some((r) => r.test(text));
  if (!crisisExempt) {
    const rl = await rateLimitEnforced(db, `chat:${userId}`, { limit: 120, windowMs: 60 * 60_000 });
    if (!rl.ok) return jsonError(429, "rate_limited");
  }

  // Fire-and-forget photo captioning after the response streams.
  after(async () => {
    try {
      await captionPending(userId, effectiveMedia);
    } catch {
      /* best effort */
    }
  });

  return ndjsonStream(sendMessage({ userId, text, clientId, mediaIds: effectiveMedia, kind, signal: req.signal }));
}

async function captionPending(userId: string, mediaIds: string[]): Promise<void> {
  if (mediaIds.length === 0) return;
  const ports = getPorts();
  const db = await getDb();
  const env = getEnv();
  const profile = await getProfile(db, userId);
  const localDate = localParts(ports.clock.now(), profile?.timezone || "UTC").date;
  const usage = await getDailyUsage(db, userId, localDate);
  const global = await getGlobalUsage(db, localDate);
  // Bounded by BOTH the per-user daily cap and the fleet-wide daily backstop.
  let budget = Math.max(0, Math.min(env.caps.caption - usage.captions, env.caps.globalCaption - global.captions));
  for (const id of mediaIds) {
    if (budget <= 0) break;
    const m = await getMedia(db, userId, id);
    if (!m || m.captionStatus !== "pending") continue;
    const bytes = await ports.blob.get(m.keyFull);
    if (!bytes) {
      await setCaption(db, id, { aiCaption: null, placeHint: null, sensitive: false, captionStatus: "failed" });
      continue;
    }
    const cap = await ports.ai.captionPhoto({ bytes, mediaType: "image/jpeg" });
    if (cap) {
      await setCaption(db, id, { aiCaption: cap.caption, placeHint: cap.placeHint, sensitive: cap.sensitive, captionStatus: "done" });
      await bumpUsage(db, userId, localDate, { captions: 1 });
      budget--;
    } else {
      await setCaption(db, id, { aiCaption: null, placeHint: null, sensitive: false, captionStatus: "failed" });
    }
  }
}
