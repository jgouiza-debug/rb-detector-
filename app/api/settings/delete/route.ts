import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { getPorts } from "@/lib/ports";
import { deleteUserCompletely } from "@/lib/account/deleteUser";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({ confirm: z.literal("delete") });

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "confirm_required", 'type "delete" to confirm');
  const db = await getDb();
  await deleteUserCompletely(db, getPorts(), s.session.userId);
  return json({ ok: true });
}
