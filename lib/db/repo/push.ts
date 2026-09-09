import { and, eq, sql } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { pushSubscriptions, type PushSubscription } from "@/lib/db/schema";

type Exec = Db | Tx;

export async function upsertPushSubscription(db: Exec, s: { userId: string; endpoint: string; p256dh: string; auth: string; userAgent?: string | null }): Promise<void> {
  await db
    .insert(pushSubscriptions)
    .values({ userId: s.userId, endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth, userAgent: s.userAgent ?? null })
    .onConflictDoUpdate({ target: pushSubscriptions.endpoint, set: { userId: s.userId, p256dh: s.p256dh, auth: s.auth, userAgent: s.userAgent ?? null, failCount: 0 } });
}

export async function listPushSubscriptions(db: Exec, userId: string): Promise<PushSubscription[]> {
  return db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
}

/**
 * Delete a subscription by its endpoint. Pass `userId` for anything that acts on
 * a client-supplied endpoint (an unsubscribe request) so one account can never
 * delete another's row; the server-internal scheduler, which already owns the
 * row it read, may call without it.
 */
export async function deletePushByEndpoint(db: Exec, endpoint: string, userId?: string): Promise<void> {
  const where = userId ? and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, userId)) : eq(pushSubscriptions.endpoint, endpoint);
  await db.delete(pushSubscriptions).where(where);
}

export async function bumpPushFailure(db: Exec, endpoint: string): Promise<void> {
  await db
    .update(pushSubscriptions)
    .set({ failCount: sql`${pushSubscriptions.failCount} + 1` })
    .where(eq(pushSubscriptions.endpoint, endpoint));
  await db.delete(pushSubscriptions).where(and(eq(pushSubscriptions.endpoint, endpoint), sql`${pushSubscriptions.failCount} >= 5`));
}
