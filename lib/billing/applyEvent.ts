import "server-only";
import { withTx } from "@/lib/db/client";
import { claimBillingEvent, markBillingProcessed } from "@/lib/db/repo/billingEvents";
import { getProfile, getProfileByEmail, updateProfile } from "@/lib/db/repo/profiles";
import { getSubscription, getSubscriptionByCustomer, upsertSubscription } from "@/lib/db/repo/subscriptions";
import { getPorts } from "@/lib/ports";
import type { BillingEvent } from "@/lib/ports/billing";

export type ApplyOutcome = "applied" | "replayed" | "stale" | "no_user";

/**
 * The single funnel every billing signal flows through: the signed Stripe
 * webhook, the checkout-success sync, the Settings refresh, and the local mock.
 * Idempotent (insert-before-process), order-safe (last_event_at guard), and it
 * attaches the Stripe email to an anonymous account so a payer never loses access.
 */
export async function applyBillingEvent(ev: BillingEvent): Promise<ApplyOutcome> {
  return withTx(async (tx) => {
    // Resolve the user: prefer the event's userId, else look up by customer id.
    let userId = ev.userId;
    if (!userId && ev.customerId) {
      const existing = await getSubscriptionByCustomer(tx, ev.customerId);
      userId = existing?.userId ?? null;
    }
    if (!userId) {
      // Record the event so a later, better-identified event can supersede it, but do nothing.
      await claimBillingEvent(tx, ev.id, ev.type, null, ev.payload);
      await markBillingProcessed(tx, ev.id, "no_user");
      return "no_user";
    }

    const claim = await claimBillingEvent(tx, ev.id, ev.type, userId, ev.payload);
    if (claim === "processed") return "replayed";

    const current = await getSubscription(tx, userId);
    if (current?.lastEventAt && current.lastEventAt.getTime() > ev.createdAt.getTime()) {
      await markBillingProcessed(tx, ev.id, "stale");
      return "stale";
    }

    const status = ev.type === "subscription_deleted" ? "canceled" : (ev.status ?? current?.status ?? "active");
    await upsertSubscription(tx, {
      userId,
      stripeCustomerId: ev.customerId ?? current?.stripeCustomerId ?? null,
      stripeSubscriptionId: ev.subscriptionId ?? current?.stripeSubscriptionId ?? null,
      status,
      currentPeriodEnd: ev.currentPeriodEnd ?? current?.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: ev.cancelAtPeriodEnd,
      lastEventAt: ev.createdAt,
    });

    // Attach the Stripe email to an anonymous account so Pip+ survives a new device.
    if (ev.type === "checkout_completed" && ev.email) {
      const profile = await getProfile(tx, userId);
      if (profile && (profile.isAnonymous || !profile.email)) {
        const clash = await getProfileByEmail(tx, ev.email);
        if (clash && clash.id !== userId) {
          await updateProfile(tx, userId, { needsEmailLink: true, email: profile.email ?? null });
        } else {
          const outcome = await getPorts().auth.attachEmail(userId, ev.email);
          if (outcome === "attached") await updateProfile(tx, userId, { email: ev.email, isAnonymous: false, needsEmailLink: false });
          else await updateProfile(tx, userId, { needsEmailLink: true });
        }
      }
    }

    await markBillingProcessed(tx, ev.id, null);
    return "applied";
  });
}
