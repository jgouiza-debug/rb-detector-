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
 *
 * The auth-side email attach runs AFTER the transaction commits. `attachEmail`
 * talks to the auth system (Supabase admin API in cloud, the profiles table in
 * local mode); calling it while the transaction still holds the connection
 * deadlocks pglite, which serves every query on a single connection.
 */
export async function applyBillingEvent(ev: BillingEvent): Promise<ApplyOutcome> {
  const { outcome, attach } = await withTx(async (tx) => {
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
      return { outcome: "no_user" as ApplyOutcome, attach: null };
    }

    const claim = await claimBillingEvent(tx, ev.id, ev.type, userId, ev.payload);
    if (claim === "processed") return { outcome: "replayed" as ApplyOutcome, attach: null };

    const current = await getSubscription(tx, userId);
    if (current?.lastEventAt && current.lastEventAt.getTime() > ev.createdAt.getTime()) {
      await markBillingProcessed(tx, ev.id, "stale");
      return { outcome: "stale" as ApplyOutcome, attach: null };
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

    // Decide whether the Stripe email should be attached to this account, using the
    // transaction for the clash check. The actual auth-side attach happens after commit.
    let attach: { userId: string; email: string } | null = null;
    if (ev.type === "checkout_completed" && ev.email) {
      const profile = await getProfile(tx, userId);
      if (profile && (profile.isAnonymous || !profile.email)) {
        const clash = await getProfileByEmail(tx, ev.email);
        if (clash && clash.id !== userId) {
          // Someone else already owns this email: keep this account anonymous but
          // prompt them to link a different one so Pip+ survives a new device.
          await updateProfile(tx, userId, { needsEmailLink: true, email: profile.email ?? null });
        } else {
          attach = { userId, email: ev.email };
        }
      }
    }

    await markBillingProcessed(tx, ev.id, null);
    return { outcome: "applied" as ApplyOutcome, attach };
  });

  // Outside the transaction: attach the email at the auth layer, then reflect the
  // result on the profile. Safe to run now that the connection is free.
  if (attach) {
    const result = await getPorts().auth.attachEmail(attach.userId, attach.email);
    await withTx(async (tx) => {
      if (result === "attached") {
        await updateProfile(tx, attach.userId, { email: attach.email, isAnonymous: false, needsEmailLink: false });
      } else {
        await updateProfile(tx, attach.userId, { needsEmailLink: true });
      }
    });
  }

  return outcome;
}
