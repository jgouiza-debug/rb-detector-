import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { updateProfile } from "@/lib/db/repo/profiles";
import { AuthError } from "@/lib/ports/auth";
import { getPorts } from "@/lib/ports";
import { json, jsonError, requireSession } from "@/lib/util/http";
import { rateLimitEnforced } from "@/lib/util/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const Body = z.object({ email: z.string().email(), code: z.string().min(4).max(10) });

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input");
  // Same brute-force throttle as sign-in: cap code attempts per session+email.
  const db = await getDb();
  const rl = await rateLimitEnforced(db, `otp-link:${s.session.userId}:${parsed.data.email.toLowerCase()}`, { limit: 10, windowMs: 15 * 60_000 });
  if (!rl.ok) return jsonError(429, "rate_limited", "too many attempts, try again in a bit");
  try {
    const session = await getPorts().auth.verifyEmailLink(parsed.data.email, parsed.data.code);
    await updateProfile(db, session.userId, { email: session.email, isAnonymous: false, needsEmailLink: false });
    return json({ ok: true, email: session.email });
  } catch (e) {
    return jsonError(400, e instanceof AuthError ? e.code : "unknown", e instanceof Error ? e.message : undefined);
  }
}
