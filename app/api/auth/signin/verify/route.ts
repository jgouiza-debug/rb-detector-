import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthError } from "@/lib/ports/auth";
import { getPorts } from "@/lib/ports";
import { json, jsonError } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const Body = z.object({ email: z.string().email(), code: z.string().min(4).max(10) });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input");
  try {
    const session = await getPorts().auth.verifyEmailSignIn(parsed.data.email, parsed.data.code);
    return json({ ok: true, userId: session.userId });
  } catch (e) {
    return jsonError(400, e instanceof AuthError ? e.code : "unknown", e instanceof Error ? e.message : undefined);
  }
}
