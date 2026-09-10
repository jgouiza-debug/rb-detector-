import { getDb } from "@/lib/db/client";
import { isPlus } from "@/lib/billing/entitlements";
import { getProfile } from "@/lib/db/repo/profiles";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { getPorts } from "@/lib/ports";
import { requireSessionRedirect } from "@/lib/util/session";
import { BreathingPacer } from "@/components/pause/BreathingPacer";

export const dynamic = "force-dynamic";
export const metadata = { title: "a pause" };

export default async function PausePage() {
  const session = await requireSessionRedirect();
  const db = await getDb();
  const profile = await getProfile(db, session.userId);
  const sub = await getSubscription(db, session.userId);
  const plus = isPlus(sub, getPorts().clock.now());
  const haptics = profile?.prefs?.haptics !== false;
  return <BreathingPacer sessionSeconds={90} haptics={haptics} plus={plus} />;
}
