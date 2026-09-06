import { NextRequest, after } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { getMedia, setCaption } from "@/lib/db/repo/media";
import { bumpUsage, getDailyUsage } from "@/lib/db/repo/usage";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { sendMessage } from "@/lib/chat/sendMessage";
import { jsonError, requireSession } from "@/lib/util/http";
import { ndjsonStream } from "@/lib/util/ndjson";
import { clientIp, rateLimit } from "@/lib/util/rateLimit";
import { localParts } from "@/lib/time/local";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({
  clientId: z.string().min(1).max(80),
  text: z.string().max(4000).default(""),
  mediaIds: z.array(z.string().uuid()).max(6).default([]),
});

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const rl = await rateLimit(db, `chat:${clientIp(req.headers)}`, { limit: 120, windowMs: 60 * 60_000 });
  if (!rl.ok) return jsonError(429, "rate_limited");
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input", parsed.error.message);
  const { clientId, text, mediaIds } = parsed.data;
  if (!text.trim() && mediaIds.length === 0) return jsonError(400, "empty");

  const userId = s.session.userId;

  // Fire-and-forget photo captioning after the response streams.
  after(async () => {
    try {
      await captionPending(userId, mediaIds);
    } catch {
      /* best effort */
    }
  });

  return ndjsonStream(sendMessage({ userId, text, clientId, mediaIds, signal: req.signal }));
}

async function captionPending(userId: string, mediaIds: string[]): Promise<void> {
  if (mediaIds.length === 0) return;
  const ports = getPorts();
  const db = await getDb();
  const env = getEnv();
  const profile = await getProfile(db, userId);
  const localDate = localParts(ports.clock.now(), profile?.timezone || "UTC").date;
  const usage = await getDailyUsage(db, userId, localDate);
  let budget = Math.max(0, env.caps.caption - usage.captions);
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
