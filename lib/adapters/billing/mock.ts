import { getEnv } from "@/lib/env";
import type { BillingEvent, BillingPort, PriceInfo } from "@/lib/ports/billing";
import { newId } from "@/lib/util/ids";

/**
 * Local billing. createCheckoutUrl points at the in-app /dev/checkout page; the
 * synthetic events it (and /dev/portal) produce are fed through the SAME
 * applyBillingEvent as the real Stripe webhook, so gating logic is identical.
 */
export function mockBilling(): BillingPort {
  return {
    async createCheckoutUrl({ userId, successUrl, cancelUrl }) {
      const sessionId = `cs_local_${newId()}`;
      const url = `/dev/checkout?sid=${encodeURIComponent(sessionId)}&uid=${encodeURIComponent(userId)}&success=${encodeURIComponent(successUrl)}&cancel=${encodeURIComponent(cancelUrl)}`;
      return { url, sessionId };
    },
    async createPortalUrl() {
      return `/dev/portal`;
    },
    async parseWebhook(): Promise<BillingEvent[]> {
      // Local webhooks arrive through /api/dev/billing/*, not this path.
      return [];
    },
    async syncCheckoutSession(): Promise<BillingEvent | null> {
      return null;
    },
    async refreshCustomer(): Promise<BillingEvent | null> {
      return null;
    },
    async cancelSubscriptionNow(): Promise<void> {
      /* no-op locally */
    },
    async getPrice(): Promise<PriceInfo | null> {
      const label = getEnv().billing.priceLabel;
      return { amount: 499, currency: "usd", interval: "month", label };
    },
  };
}
