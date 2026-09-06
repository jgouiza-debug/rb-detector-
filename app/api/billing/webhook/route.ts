import { NextRequest } from "next/server";
import { applyBillingEvent } from "@/lib/billing/applyEvent";
import { getPorts } from "@/lib/ports";
import { BillingSignatureError } from "@/lib/ports/billing";
import { json, jsonError } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Public endpoint (excluded from the proxy matcher). Verifies the signature on the raw body. */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("stripe-signature");
  let events;
  try {
    events = await getPorts().billing.parseWebhook(raw, signature);
  } catch (e) {
    if (e instanceof BillingSignatureError) return jsonError(400, "bad_signature", e.message);
    return jsonError(400, "parse_error");
  }
  try {
    for (const ev of events) await applyBillingEvent(ev);
  } catch (e) {
    // Return 500 so Stripe retries; the retry finds the event unprocessed and proceeds.
    return jsonError(500, "apply_error", e instanceof Error ? e.message : undefined);
  }
  return json({ received: true });
}
