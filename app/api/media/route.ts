import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/client";
import { insertMedia } from "@/lib/db/repo/media";
import { ImageRejectedError, processImage } from "@/lib/media/process";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError(400, "no_file");
  if (file.size > MAX_BYTES) return jsonError(413, "too_large", "that photo is a bit big — try a smaller one");
  const bytes = new Uint8Array(await file.arrayBuffer());
  try {
    const processed = await processImage(s.session.userId, bytes);
    const db = await getDb();
    const row = await insertMedia(db, {
      userId: s.session.userId,
      keyFull: processed.keyFull,
      keyThumb: processed.keyThumb,
      width: processed.width,
      height: processed.height,
      bytes: processed.bytes,
    });
    return json({ mediaId: row.id });
  } catch (e) {
    if (e instanceof ImageRejectedError) return jsonError(415, "unsupported_media", e.message);
    return jsonError(500, "process_failed", "couldn't process that photo");
  }
}
