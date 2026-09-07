import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { isDateLocked } from "@/lib/billing/window";
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
  if (isISODate(date)) {
    const db = await getDb();
    const ports = getPorts();
    const profile = await getProfile(db, session.userId);
    const today = localParts(ports.clock.now(), profile?.timezone || "UTC").date;
    locked = await isDateLocked(db, session.userId, date, ports.clock.now(), today);
  }
  return <MemoryDetail date={date} priceLabel={getEnv().billing.priceLabel} locked={locked} />;
}
