import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Stripe from "stripe";

const SECRET = "whsec_testsecret";

function envSetup() {
  // Only the Stripe adapter is under test; pin every other provider to its
  // lightest cloud-valid option. Auth uses supabase (with dummy creds) because
  // the local auth adapter is refused in cloud mode; the adapter is never
  // constructed here, so the placeholder values are enough for env validation.
  process.env.APP_MODE = "cloud";
  process.env.DB_PROVIDER = "pglite";
  process.env.AUTH_PROVIDER = "supabase";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon_x";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service_x";
  process.env.BLOB_PROVIDER = "fs";
  process.env.AI_PROVIDER = "scripted";
  process.env.PUSH_PROVIDER = "outbox";
  process.env.BILLING_PROVIDER = "stripe";
  process.env.STRIPE_SECRET_KEY = "sk_test_x";
  process.env.STRIPE_WEBHOOK_SECRET = SECRET;
  process.env.STRIPE_PRICE_ID = "price_x";
  process.env.CRON_SECRET = "c";
}

let stripeBilling: typeof import("@/lib/adapters/billing/stripe").stripeBilling;

beforeEach(async () => {
  envSetup();
  const env = await import("@/lib/env");
  env.resetEnvCache();
  stripeBilling = (await import("@/lib/adapters/billing/stripe")).stripeBilling;
});
afterEach(() => vi.resetModules());

function subUpdatedEvent(periodEnd: number, opts: { onItem?: boolean } = {}) {
  const stripe = new Stripe("sk_test_x");
  const item = { id: "si_1", ...(opts.onItem !== false ? { current_period_end: periodEnd } : {}) };
  const payload = JSON.stringify({
    id: "evt_1",
    object: "event",
    api_version: "2025-03-31.basil",
    created: 1_760_000_000,
    type: "customer.subscription.updated",
    data: { object: { id: "sub_1", object: "subscription", status: "active", customer: "cus_1", cancel_at_period_end: false, metadata: { userId: "u1" }, items: { data: [item] } } },
  });
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret: SECRET });
  return { payload, header };
}

describe("stripe adapter parseWebhook", () => {
  it("verifies a valid signature and reads current_period_end from the subscription item (basil)", async () => {
    const b = stripeBilling();
    const { payload, header } = subUpdatedEvent(1_762_000_000);
    const events = await b.parseWebhook(payload, header);
    expect(events).toHaveLength(1);
    expect(events[0].type).toBe("subscription_updated");
    expect(events[0].status).toBe("active");
    expect(events[0].userId).toBe("u1");
    expect(events[0].currentPeriodEnd?.getTime()).toBe(1_762_000_000 * 1000);
  });

  // NOTE: assert on the error name, not instanceof — vi.resetModules() gives the
  // adapter a distinct BillingSignatureError class from the one imported here.
  it("rejects a tampered body as a signature error", async () => {
    const b = stripeBilling();
    const { payload, header } = subUpdatedEvent(1_762_000_000);
    await expect(b.parseWebhook(payload + " ", header)).rejects.toMatchObject({ name: "BillingSignatureError" });
  });

  it("rejects a missing signature header as a signature error", async () => {
    const b = stripeBilling();
    const { payload } = subUpdatedEvent(1_762_000_000);
    await expect(b.parseWebhook(payload, null)).rejects.toMatchObject({ name: "BillingSignatureError" });
  });
});
