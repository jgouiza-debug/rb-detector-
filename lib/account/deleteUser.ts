import "server-only";
import { eq } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { billingEvents, localOtps, profiles, pushOutbox } from "@/lib/db/schema";
import { getProfile } from "@/lib/db/repo/profiles";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import type { Ports } from "@/lib/ports";

/**
 * Ordered and each step idempotent, so the route is safe to re-run.
 * Deletes leave zero rows in EVERY table (incl. the un-FK'd audit tables) and
 * zero blobs under the user's prefix.
 */
export async function deleteUserCompletely(db: Db, ports: Ports, userId: string): Promise<void> {
  // 1. Cancel any live subscription. Deletion must still succeed if Stripe is
  //    down, but retry first so a transient failure doesn't leave a live
  //    subscription billing a person whose account is gone.
  const sub = await getSubscription(db, userId);
  if (sub?.stripeSubscriptionId) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await ports.billing.cancelSubscriptionNow(sub.stripeSubscriptionId);
        break;
      } catch (e) {
        if (attempt === 2) {
          console.error(`delete: failed to cancel subscription ${sub.stripeSubscriptionId} for ${userId}`, e);
          break;
        }
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }
  // 2. Delete every photo (blobs) before rows.
  await ports.blob.deletePrefix(`${userId}/`);

  // 3. Explicitly purge tables not covered by the profiles cascade.
  const profile = await getProfile(db, userId);
  await db.delete(billingEvents).where(eq(billingEvents.userId, userId));
  await db.delete(pushOutbox).where(eq(pushOutbox.userId, userId));
  // Purge OTPs by user id (covers abandoned link rows even when profiles.email is null).
  await db.delete(localOtps).where(eq(localOtps.userId, userId));
  if (profile?.email) await db.delete(localOtps).where(eq(localOtps.email, profile.email));

  // 4. Delete the profile row (cascades messages, media, memories, subscriptions, push, nudge_log, usage_daily, safety_events).
  await db.delete(profiles).where(eq(profiles.id, userId));

  // 5. Delete the auth user, then clear the session.
  await ports.auth.deleteAuthUser(userId);
  await ports.auth.signOut();
}
