import { NextRequest } from "next/server";
import { applyBillingEvent } from "@/lib/billing/applyEvent";
import { getDb } from "@/lib/db/client";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { devGuard } from "@/lib/util/devGuard";
import { getPorts } from "@/lib/ports";
import { json, jsonError, requireSession } from "@/lib/util/http";
import { newId } from "@/lib/util/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Portal actions: cancel-at-period-end, resume, or expire-now. */
export async function POST(req: NextRequest) {
  const guard = devGuard();
  if (guard) return guard;
  const s = await requireSession();
  if ("response" in s) return s.response;
  const body = (await req.json().catch(() => ({}))) as { action?: "cancel_at_period_end" | "resume" | "expire_now" };
  const db = await getDb();
  const sub = await getSubscription(db, s.session.userId);
  if (!sub?.stripeCustomerId) return jsonError(400, "no_customer");
  const now = getPorts().clock.now();

  const action = body.action ?? "cancel_at_period_end";
  const base = {
    id: `local:${newId()}`,
    createdAt: now,
    userId: s.session.userId,
    customerId: sub.stripeCustomerId,
    subscriptionId: sub.stripeSubscriptionId,
    email: null,
    payload: { local: true },
  } as const;

  if (action === "expire_now") {
    await applyBillingEvent({ ...base, type: "subscription_deleted", status: "canceled", currentPeriodEnd: now, cancelAtPeriodEnd: false });
  } else if (action === "resume") {
    await applyBillingEvent({ ...base, type: "subscription_updated", status: "active", currentPeriodEnd: sub.currentPeriodEnd, cancelAtPeriodEnd: false });
  } else {
    await applyBillingEvent({ ...base, type: "subscription_updated", status: "canceled", currentPeriodEnd: sub.currentPeriodEnd, cancelAtPeriodEnd: true });
  }
  return json({ ok: true, action });
}
