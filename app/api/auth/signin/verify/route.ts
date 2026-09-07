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
  const db = await getDb();
  // Throttle code guesses at the app layer (Supabase also throttles in cloud).
  const rl = await rateLimitEnforced(db, `otp:${clientIp(req.headers)}:${parsed.data.email}`, { limit: 10, windowMs: 15 * 60_000 });
  if (!rl.ok) return jsonError(429, "rate_limited");
  try {
    const session = await getPorts().auth.verifyEmailSignIn(parsed.data.email, parsed.data.code);
    return json({ ok: true, userId: session.userId });
  } catch (e) {
    return jsonError(400, e instanceof AuthError ? e.code : "unknown", e instanceof Error ? e.message : undefined);
  }
}
