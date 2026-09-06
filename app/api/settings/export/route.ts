import { getDb } from "@/lib/db/client";
import { getPorts } from "@/lib/ports";
import { buildExportZip } from "@/lib/export/buildZip";
import { requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const stream = await buildExportZip(db, getPorts(), s.session.userId);
  const date = new Date().toISOString().slice(0, 10);
  return new Response(stream, {
    headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename="pip-export-${date}.zip"`, "Cache-Control": "no-store" },
  });
}
