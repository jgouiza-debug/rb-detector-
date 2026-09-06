import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthError } from "@/lib/ports/auth";
import { getPorts } from "@/lib/ports";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const Body = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_email");
  try {
    await getPorts().auth.startEmailLink(parsed.data.email);
    return json({ ok: true });
  } catch (e) {
    return jsonError(400, e instanceof AuthError ? e.code : "unknown", e instanceof Error ? e.message : undefined);
  }
}
