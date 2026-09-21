import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { getTranscriptionKey, setTranscriptionKey } from "@/lib/db/repo/profiles";
import { json, jsonError, requireSession } from "@/lib/util/http";
import { clientIp, rateLimitEnforced } from "@/lib/util/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ key: z.string().min(8).max(400) });

// GET only reports whether a key is set — the key itself is write-only and never
// returned to a client.
export async function GET() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const key = await getTranscriptionKey(db, s.session.userId);
  return json({ configured: !!key });
}

export async function PUT(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const rl = await rateLimitEnforced(db, `txkey:${clientIp(req.headers)}`, { limit: 20, windowMs: 60 * 60_000 });
  if (!rl.ok) return jsonError(429, "rate_limited");
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input", parsed.error.message);
  await setTranscriptionKey(db, s.session.userId, parsed.data.key.trim());
  return json({ ok: true, configured: true });
}

export async function DELETE() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  await setTranscriptionKey(db, s.session.userId, null);
  return json({ ok: true, configured: false });
}
