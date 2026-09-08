import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { isDateLocked } from "@/lib/billing/window";
import { getTimeline } from "@/lib/timeline/query";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { isISODate, localParts } from "@/lib/time/local";
import { requireSessionRedirect } from "@/lib/util/session";
import { MemoryDetail } from "@/components/timeline/MemoryDetail";

export const dynamic = "force-dynamic";
export const metadata = { title: "a memory" };

export default async function MemoryPage({ params }: { params: Promise<{ date: string }> }) {
  const session = await requireSessionRedirect();
  const { date } = await params;
  // Decide the paywall on the server so the client never has to make a request that fails.
  let locked = false;
  // The locked screen asks you to pay, so it should name what it is holding:
  // "there are 4 more days of you" beats "the free version keeps seven days".
  let lockedCount = 0;
  if (isISODate(date)) {
    const db = await getDb();
    const ports = getPorts();
    const profile = await getProfile(db, session.userId);
    const today = localParts(ports.clock.now(), profile?.timezone || "UTC").date;
    locked = await isDateLocked(db, session.userId, date, ports.clock.now(), today);
    if (locked) lockedCount = (await getTimeline(db, session.userId, ports.clock.now(), today)).lockedCount;
  }
  return <MemoryDetail date={date} priceLabel={getEnv().billing.priceLabel} locked={locked} lockedCount={lockedCount} />;
}
