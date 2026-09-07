import type { Db, Tx } from "@/lib/db/client";
import { getEntitlement } from "@/lib/billing/entitlements";
import { addDays } from "@/lib/time/local";

/** True when `date` falls outside the free plan's rolling window (Pip+ has no window). */
export async function isDateLocked(db: Db | Tx, userId: string, date: string, now: Date, today: string): Promise<boolean> {
  const ent = await getEntitlement(db, userId, now);
  if (!ent.windowDays) return false;
  const start = addDays(today, -(ent.windowDays - 1));
  return date < start;
}
