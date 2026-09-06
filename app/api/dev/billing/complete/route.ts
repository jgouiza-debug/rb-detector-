import { NextRequest } from "next/server";
import { applyBillingEvent } from "@/lib/billing/applyEvent";
import { devGuard } from "@/lib/util/devGuard";
import { getPorts } from "@/lib/ports";
import { json, requireSession } from "@/lib/util/http";
import { newId } from "@/lib/util/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Mimics checkout.session.completed + subscription.updated locally. */
export async function POST(req: NextRequest) {
  const guard = devGuard();
  if (guard) return guard;
  const s = await requireSession();
  if ("response" in s) return s.response;
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const now = getPorts().clock.now();
  const customerId = `cus_local_${s.session.userId.slice(0, 8)}`;
  const subscriptionId = `sub_local_${s.session.userId.slice(0, 8)}`;
  const periodEnd = new Date(now.getTime() + 30 * 86_400_000);
  await applyBillingEvent({
    id: `local:${newId()}`,
    type: "checkout_completed",
    createdAt: now,
    userId: s.session.userId,
    customerId,
    subscriptionId,
    status: "active",
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    email: body.email ?? s.session.email ?? `${s.session.userId.slice(0, 8)}@local.pip`,
    payload: { local: true },
  });
  return json({ ok: true });
}
