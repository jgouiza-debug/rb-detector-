import Stripe from "stripe";
import { getEnv } from "@/lib/env";
import { BillingSignatureError, type BillingEvent, type BillingEventType, type BillingPort, type PriceInfo, type SubscriptionStatus } from "@/lib/ports/billing";

let client: Stripe | null = null;
function stripe(): Stripe {
  if (client) return client;
  const key = getEnv().billing.secretKey;
  if (!key) throw new Error("STRIPE_SECRET_KEY is required for BILLING_PROVIDER=stripe");
  client = new Stripe(key);
  return client;
}

/** stripe@22 (basil): current_period_end lives on the subscription item, not the root. */
function periodEnd(sub: Stripe.Subscription): Date | null {
  const item = sub.items?.data?.[0];
  const secs = (item as { current_period_end?: number } | undefined)?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end;
  return typeof secs === "number" ? new Date(secs * 1000) : null;
}

function subEvent(id: string, type: BillingEventType, createdAt: Date, sub: Stripe.Subscription, extra?: { email?: string | null; userId?: string | null }): BillingEvent {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  return {
    id,
    type,
    createdAt,
    userId: extra?.userId ?? (sub.metadata?.userId ?? null),
    customerId,
    subscriptionId: sub.id,
    status: sub.status as SubscriptionStatus,
    currentPeriodEnd: periodEnd(sub),
    cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
    email: extra?.email ?? null,
    payload: { id: sub.id, status: sub.status },
  };
}

async function subscriptionIdFromInvoice(inv: Stripe.Invoice): Promise<string | null> {
  const direct = (inv as unknown as { subscription?: string | { id: string } }).subscription;
  if (direct) return typeof direct === "string" ? direct : direct.id;
  const parent = (inv as unknown as { parent?: { subscription_details?: { subscription?: string | { id: string } } } }).parent;
  const s = parent?.subscription_details?.subscription;
  return s ? (typeof s === "string" ? s : s.id) : null;
}

export function stripeBilling(): BillingPort {
  return {
    async createCheckoutUrl({ userId, email, customerId, successUrl, cancelUrl }) {
      const price = getEnv().billing.priceId as string;
      const session = await stripe().checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price, quantity: 1 }],
        ...(customerId ? { customer: customerId } : email ? { customer_email: email } : {}),
        client_reference_id: userId,
        metadata: { userId },
        subscription_data: { metadata: { userId } },
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      if (!session.url) throw new Error("stripe did not return a checkout url");
      return { url: session.url, sessionId: session.id };
    },
    async createPortalUrl({ customerId, returnUrl }) {
      const portal = await stripe().billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
      return portal.url;
    },
    async parseWebhook(rawBody, signature): Promise<BillingEvent[]> {
      const secret = getEnv().billing.webhookSecret as string;
      if (!signature) throw new BillingSignatureError("missing stripe-signature header");
      let event: Stripe.Event;
      try {
        event = await stripe().webhooks.constructEventAsync(rawBody, signature, secret);
      } catch (e) {
        throw new BillingSignatureError(e instanceof Error ? e.message : "signature verification failed");
      }
      const createdAt = new Date(event.created * 1000);
      switch (event.type) {
        case "checkout.session.completed": {
          const s = event.data.object as Stripe.Checkout.Session;
          const subId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
          if (!subId) return [];
          const sub = await stripe().subscriptions.retrieve(subId);
          return [subEvent(event.id, "checkout_completed", createdAt, sub, { email: s.customer_details?.email ?? s.customer_email ?? null, userId: s.client_reference_id ?? s.metadata?.userId ?? null })];
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
          return [subEvent(event.id, "subscription_updated", createdAt, event.data.object as Stripe.Subscription)];
        case "customer.subscription.deleted":
          return [subEvent(event.id, "subscription_deleted", createdAt, event.data.object as Stripe.Subscription)];
        case "invoice.paid":
        case "invoice.payment_failed": {
          const inv = event.data.object as Stripe.Invoice;
          const subId = await subscriptionIdFromInvoice(inv);
          if (!subId) return [];
          const sub = await stripe().subscriptions.retrieve(subId);
          return [subEvent(event.id, event.type === "invoice.paid" ? "payment_succeeded" : "payment_failed", createdAt, sub)];
        }
        default:
          return [];
      }
    },
    async syncCheckoutSession(sessionId): Promise<BillingEvent | null> {
      const session = await stripe().checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
      const sub = session.subscription;
      if (!sub || typeof sub === "string") return null;
      return subEvent(`sync:${sessionId}`, "checkout_completed", new Date(), sub, {
        email: session.customer_details?.email ?? session.customer_email ?? null,
        userId: session.client_reference_id ?? session.metadata?.userId ?? null,
      });
    },
    async refreshCustomer(customerId): Promise<BillingEvent | null> {
      const subs = await stripe().subscriptions.list({ customer: customerId, status: "all", limit: 1 });
      const sub = subs.data[0];
      if (!sub) return null;
      return subEvent(`refresh:${customerId}:${Date.now()}`, "subscription_updated", new Date(), sub);
    },
    async cancelSubscriptionNow(subscriptionId): Promise<void> {
      await stripe().subscriptions.cancel(subscriptionId);
    },
    async getPrice(): Promise<PriceInfo | null> {
      try {
        const price = await stripe().prices.retrieve(getEnv().billing.priceId as string);
        const amount = price.unit_amount ?? 0;
        const interval = (price.recurring?.interval ?? "month") as PriceInfo["interval"];
        const label = `$${(amount / 100).toFixed(2)}/${interval === "month" ? "mo" : interval === "year" ? "yr" : interval}`;
        return { amount, currency: price.currency, interval, label };
      } catch {
        return null;
      }
    },
  };
}
