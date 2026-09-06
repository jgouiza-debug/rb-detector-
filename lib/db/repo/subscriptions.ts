import { eq } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { subscriptions, type Subscription } from "@/lib/db/schema";

type Exec = Db | Tx;

export async function getSubscription(db: Exec, userId: string): Promise<Subscription | null> {
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function getSubscriptionByCustomer(db: Exec, customerId: string): Promise<Subscription | null> {
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.stripeCustomerId, customerId)).limit(1);
  return rows[0] ?? null;
}

export async function upsertSubscription(
  db: Exec,
  s: { userId: string; stripeCustomerId: string | null; stripeSubscriptionId: string | null; status: string; currentPeriodEnd: Date | null; cancelAtPeriodEnd: boolean; lastEventAt: Date },
): Promise<Subscription> {
  const rows = await db
    .insert(subscriptions)
    .values({ ...s, plan: "plus" })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        stripeCustomerId: s.stripeCustomerId,
        stripeSubscriptionId: s.stripeSubscriptionId,
        status: s.status,
        currentPeriodEnd: s.currentPeriodEnd,
        cancelAtPeriodEnd: s.cancelAtPeriodEnd,
        lastEventAt: s.lastEventAt,
        updatedAt: new Date(),
      },
    })
    .returning();
  return rows[0];
}
