import { NextRequest } from "next/server";
import { z } from "zod";
import { AuthError } from "@/lib/ports/auth";
import { getPorts } from "@/lib/ports";
import { json, jsonError } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const Body = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_email");
  try {
    await getPorts().auth.startEmailSignIn(parsed.data.email);
    return json({ ok: true });
  } catch (e) {
    // Do not reveal whether an account exists on the "start" step beyond a soft code.
    return json({ ok: true, note: e instanceof AuthError ? e.code : "sent" });
  }
}
