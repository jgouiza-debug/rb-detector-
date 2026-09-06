import { getDb } from "@/lib/db/client";
import { applyBillingEvent } from "@/lib/billing/applyEvent";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { getPorts } from "@/lib/ports";
import { json, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const sub = await getSubscription(db, s.session.userId);
  if (!sub?.stripeCustomerId) return json({ ok: false, note: "no customer yet" });
  const ev = await getPorts().billing.refreshCustomer(sub.stripeCustomerId);
  if (!ev) return json({ ok: false });
  const outcome = await applyBillingEvent({ ...ev, userId: s.session.userId });
  return json({ ok: true, outcome });
}
