import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { deletePushByEndpoint } from "@/lib/db/repo/push";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const parsed = z.object({ endpoint: z.string() }).safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input");
  const db = await getDb();
  const endpoint = parsed.data.endpoint === "local://self" ? `local://${s.session.userId}` : parsed.data.endpoint;
  await deletePushByEndpoint(db, endpoint);
  return json({ ok: true });
}
