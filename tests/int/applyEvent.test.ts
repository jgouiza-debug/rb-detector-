import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { createProfile, getProfile } from "@/lib/db/repo/profiles";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { getBillingEvent } from "@/lib/db/repo/billingEvents";
import { setPortsForTests, type Ports } from "@/lib/ports";
import type { BillingEvent } from "@/lib/ports/billing";
import { UID_A, makeTestDb, type TestDb } from "../helpers/db";

let t: TestDb;

beforeAll(async () => {
  t = await makeTestDb();
  process.env.APP_MODE = "local";
  vi.doMock("@/lib/db/client", async () => {
    const actual = await vi.importActual<typeof import("@/lib/db/client")>("@/lib/db/client");
    return { ...actual, getDb: async () => t.db, withTx: async <T>(fn: (tx: unknown) => Promise<T>) => t.db.transaction(fn as never) };
  });
  setPortsForTests({ auth: { async attachEmail() { return "attached"; } } as unknown as Ports["auth"] } as Ports);
  await createProfile(t.db, UID_A, "UTC");
});
afterAll(async () => {
  await t.close();
});

function ev(over: Partial<BillingEvent>): BillingEvent {
  return {
    id: "evt_1",
    type: "checkout_completed",
    createdAt: new Date("2026-10-26T12:00:00Z"),
    userId: UID_A,
    customerId: "cus_1",
    subscriptionId: "sub_1",
    status: "active",
    currentPeriodEnd: new Date("2026-11-26T12:00:00Z"),
    cancelAtPeriodEnd: false,
    email: null,
    payload: {},
    ...over,
  };
}

describe("applyBillingEvent", () => {
  it("checkout_completed sets the sub active and attaches the email to an anonymous account", async () => {
    const { applyBillingEvent } = await import("@/lib/billing/applyEvent");
    const outcome = await applyBillingEvent(ev({ email: "payer@example.com" }));
    expect(outcome).toBe("applied");
    const sub = await getSubscription(t.db, UID_A);
    expect(sub?.status).toBe("active");
    expect(sub?.stripeCustomerId).toBe("cus_1");
    const profile = await getProfile(t.db, UID_A);
    expect(profile?.email).toBe("payer@example.com");
    expect(profile?.isAnonymous).toBe(false);
  });

  it("a replayed event is a no-op", async () => {
    const { applyBillingEvent } = await import("@/lib/billing/applyEvent");
    const outcome = await applyBillingEvent(ev({ id: "evt_1", status: "past_due" }));
    expect(outcome).toBe("replayed");
    const sub = await getSubscription(t.db, UID_A);
    expect(sub?.status).toBe("active"); // unchanged
  });

  it("an older out-of-order event does not downgrade the subscription", async () => {
    const { applyBillingEvent } = await import("@/lib/billing/applyEvent");
    const outcome = await applyBillingEvent(ev({ id: "evt_old", type: "subscription_updated", status: "canceled", createdAt: new Date("2026-10-25T12:00:00Z") }));
    expect(outcome).toBe("stale");
    const sub = await getSubscription(t.db, UID_A);
    expect(sub?.status).toBe("active");
  });

  it("a newer subscription_deleted event cancels", async () => {
    const { applyBillingEvent } = await import("@/lib/billing/applyEvent");
    const outcome = await applyBillingEvent(ev({ id: "evt_del", type: "subscription_deleted", status: "canceled", createdAt: new Date("2026-10-27T12:00:00Z") }));
    expect(outcome).toBe("applied");
    const sub = await getSubscription(t.db, UID_A);
    expect(sub?.status).toBe("canceled");
    // The event is recorded as processed.
    const row = await getBillingEvent(t.db, "evt_del");
    expect(row?.processedAt).toBeTruthy();
  });
});
