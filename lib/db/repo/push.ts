import { and, eq, sql } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { pushSubscriptions, type PushSubscription } from "@/lib/db/schema";

type Exec = Db | Tx;

export async function upsertPushSubscription(db: Exec, s: { userId: string; endpoint: string; p256dh: string; auth: string; userAgent?: string | null }): Promise<void> {
  await db
    .insert(pushSubscriptions)
    .values({ userId: s.userId, endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth, userAgent: s.userAgent ?? null })
    // Only refresh a row the caller already owns. If someone submits a push
    // endpoint another user registered, the conflict update is skipped rather
    // than silently reassigning that endpoint's ownership (no push hijack).
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { p256dh: s.p256dh, auth: s.auth, userAgent: s.userAgent ?? null, failCount: 0 },
      where: eq(pushSubscriptions.userId, s.userId),
    });
}

export async function listPushSubscriptions(db: Exec, userId: string): Promise<PushSubscription[]> {
  return db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
}

/** Delete a subscription the caller owns. Scoped by userId so one user cannot
 *  unsubscribe another user's device by guessing its endpoint. */
export async function deleteOwnPushByEndpoint(db: Exec, userId: string, endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)));
}

/** Unscoped delete — server-internal only (e.g. pruning a dead endpoint from the sender). */
export async function deletePushByEndpoint(db: Exec, endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

export async function bumpPushFailure(db: Exec, endpoint: string): Promise<void> {
  await db
    .update(pushSubscriptions)
    .set({ failCount: sql`${pushSubscriptions.failCount} + 1` })
    .where(eq(pushSubscriptions.endpoint, endpoint));
  await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.endpoint, endpoint), sql`${pushSubscriptions.failCount} >= 5`));
}
