import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/client";
import { getMedia } from "@/lib/db/repo/media";
import { getPorts } from "@/lib/ports";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Authenticated, ownership-checked image proxy. The browser never sees a storage URL. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const { id } = await ctx.params;
  const db = await getDb();
  const m = await getMedia(db, s.session.userId, id);
  if (!m) return jsonError(404, "not_found");

  if (req.nextUrl.searchParams.get("meta") === "1") {
    return json({ captionStatus: m.captionStatus, caption: m.aiCaption, placeHint: m.placeHint, sensitive: m.sensitive, width: m.width, height: m.height });
  }

  const variant = req.nextUrl.searchParams.get("v") === "thumb" ? m.keyThumb : m.keyFull;
  const bytes = await getPorts().blob.get(variant);
  if (!bytes) return jsonError(404, "gone");
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=300", "Content-Length": String(bytes.byteLength) },
  });
}
