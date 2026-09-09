import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { AuthError } from "@/lib/ports/auth";
import { getPorts } from "@/lib/ports";
import { json, jsonError } from "@/lib/util/http";
import { clientIp, rateLimitEnforced } from "@/lib/util/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const Body = z.object({ email: z.string().email(), code: z.string().min(4).max(10) });

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input");
  // A 6-digit code is brute-forceable; throttle attempts per email+IP so an
  // attacker can't walk the space. The email is part of the key so one target's
  // attempts don't lock the whole IP, and vice versa.
  const db = await getDb();
  const rl = await rateLimitEnforced(db, `otp-signin:${clientIp(req.headers)}:${parsed.data.email.toLowerCase()}`, { limit: 10, windowMs: 15 * 60_000 });
  if (!rl.ok) return jsonError(429, "rate_limited", "too many attempts, try again in a bit");
  try {
    const session = await getPorts().auth.verifyEmailSignIn(parsed.data.email, parsed.data.code);
    return json({ ok: true, userId: session.userId });
  } catch (e) {
    return jsonError(400, e instanceof AuthError ? e.code : "unknown", e instanceof Error ? e.message : undefined);
  }
}
