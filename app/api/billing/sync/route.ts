import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { applyBillingEvent } from "@/lib/billing/applyEvent";
import { getPorts } from "@/lib/ports";
import { json, jsonError } from "@/lib/util/http";
import { clientIp, rateLimitEnforced } from "@/lib/util/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({ sessionId: z.string().min(1) });

/**
 * Belt-and-braces path for when the webhook is late/misconfigured on first deploy.
 * Intentionally session-less: the public /checkout/done page (iOS in-app browser,
 * no cookie) calls it, and the user is derived from the Stripe session's
 * client_reference_id — never the caller's cookie. Rate-limited per IP so it can't
 * be used to hammer the Stripe API.
 */
export async function POST(req: NextRequest) {
  const db = await getDb();
  const rl = await rateLimitEnforced(db, `sync:${clientIp(req.headers)}`, { limit: 60, windowMs: 60 * 60_000 });
  if (!rl.ok) return jsonError(429, "rate_limited");
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input");
  const ev = await getPorts().billing.syncCheckoutSession(parsed.data.sessionId);
  if (!ev) return json({ ok: false, note: "no subscription on that session yet" });
  const outcome = await applyBillingEvent(ev);
  return json({ ok: true, outcome });
}
