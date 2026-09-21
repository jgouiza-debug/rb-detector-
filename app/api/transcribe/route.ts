import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/client";
import { getTranscriptionKey } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { json, jsonError, requireSession } from "@/lib/util/http";
import { rateLimitEnforced } from "@/lib/util/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024; // 20MB of audio is plenty for a thought-bump.

// Used only when a user has stored their own transcription key. Everyone else
// dictates on-device via the Web Speech path and never hits this route.
export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const rl = await rateLimitEnforced(db, `transcribe:${s.session.userId}`, { limit: 60, windowMs: 60 * 60_000 });
  if (!rl.ok) return jsonError(429, "rate_limited");

  const key = await getTranscriptionKey(db, s.session.userId);
  if (!key) return jsonError(409, "no_key", "add your transcription key in settings first");

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob)) return jsonError(400, "no_audio");
  if (file.size === 0 || file.size > MAX_BYTES) return jsonError(400, "bad_audio");

  const audio = await file.arrayBuffer();
  const mimeType = file.type || "audio/webm";
  const result = await getPorts().transcription.transcribe({ audio, mimeType, apiKey: key });
  if (!result) return jsonError(502, "transcribe_failed");
  return json({ text: result.text });
}
