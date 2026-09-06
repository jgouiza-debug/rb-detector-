import { eq } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { billingEvents, type BillingEventRow } from "@/lib/db/schema";

type Exec = Db | Tx;

/** Insert-before-process: returns 'new' if we claimed it, 'processed'/'pending' if it already existed. */
export async function claimBillingEvent(db: Exec, id: string, type: string, userId: string | null, payload: unknown): Promise<"new" | "processed" | "pending"> {
  const rows = await db
    .insert(billingEvents)
    .values({ id, type, userId, payload: payload as Record<string, unknown> })
    .onConflictDoNothing()
    .returning();
  if (rows.length > 0) return "new";
  const existing = await db.select().from(billingEvents).where(eq(billingEvents.id, id)).limit(1);
  return existing[0]?.processedAt ? "processed" : "pending";
}

export async function markBillingProcessed(db: Exec, id: string, error?: string | null): Promise<void> {
  await db.update(billingEvents).set({ processedAt: new Date(), error: error ?? null }).where(eq(billingEvents.id, id));
}

export async function getBillingEvent(db: Exec, id: string): Promise<BillingEventRow | null> {
  const rows = await db.select().from(billingEvents).where(eq(billingEvents.id, id)).limit(1);
  return rows[0] ?? null;
}
