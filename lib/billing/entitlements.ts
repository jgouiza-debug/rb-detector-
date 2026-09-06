import type { Db, Tx } from "@/lib/db/client";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { FREE_WINDOW_DAYS, type Entitlement } from "./plans";

const GRACE_MS = 3 * 24 * 60 * 60 * 1000;

/** Is this subscription row currently entitled to Pip+? Server-derived, never trusted from the client. */
export function isPlus(sub: { status: string; currentPeriodEnd: Date | null; cancelAtPeriodEnd: boolean } | null, now: Date): boolean {
  if (!sub) return false;
  const end = sub.currentPeriodEnd?.getTime() ?? 0;
  const t = now.getTime();
  if (sub.status === "active" || sub.status === "trialing") return true;
  if (sub.status === "past_due" && end + GRACE_MS > t) return true;
  if (sub.status === "canceled" && end > t) return true;
  return false;
}

export async function getEntitlement(db: Db | Tx, userId: string, now: Date): Promise<Entitlement> {
  const sub = await getSubscription(db, userId);
  return isPlus(sub, now) ? { plan: "plus", windowDays: null } : { plan: "free", windowDays: FREE_WINDOW_DAYS };
}
