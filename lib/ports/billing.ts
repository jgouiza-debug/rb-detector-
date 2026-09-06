export type SubscriptionStatus = "none" | "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid" | "paused";

export type BillingEventType =
  | "checkout_completed"
  | "subscription_updated"
  | "subscription_deleted"
  | "payment_failed"
  | "payment_succeeded";

export interface BillingEvent {
  /** Stripe event id, or 'sync:<sessionId>', 'refresh:<customerId>:<ms>', 'local:<uuid>'. */
  id: string;
  type: BillingEventType;
  createdAt: Date;
  userId: string | null;
  customerId: string;
  subscriptionId: string | null;
  status: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  email: string | null;
  /** Raw provider payload, stored for audit (never rendered). */
  payload: unknown;
}

export class BillingSignatureError extends Error {
  constructor(message = "invalid webhook signature") {
    super(message);
    this.name = "BillingSignatureError";
  }
}

export interface PriceInfo {
  amount: number; // minor units (cents)
  currency: string; // 'usd'
  interval: "month" | "year" | "week" | "day";
  label: string; // "$4.99/mo"
}

export interface BillingPort {
  createCheckoutUrl(a: {
    userId: string;
    email: string | null;
    customerId: string | null;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string; sessionId: string }>;
  createPortalUrl(a: { customerId: string; returnUrl: string }): Promise<string>;
  /** Verifies the signature and normalizes; throws BillingSignatureError. Unknown events return []. */
  parseWebhook(rawBody: string, signature: string | null): Promise<BillingEvent[]>;
  syncCheckoutSession(sessionId: string): Promise<BillingEvent | null>;
  refreshCustomer(customerId: string): Promise<BillingEvent | null>;
  cancelSubscriptionNow(subscriptionId: string): Promise<void>;
  getPrice(): Promise<PriceInfo | null>;
}
