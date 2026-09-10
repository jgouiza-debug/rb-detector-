import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { getTimeline } from "@/lib/timeline/query";
import { localParts } from "@/lib/time/local";
import { requireSessionRedirect } from "@/lib/util/session";
import { TimelineView } from "@/components/timeline/TimelineView";
import { BottomNav } from "@/components/nav/BottomNav";
import { TimelineTopBar } from "@/components/timeline/TimelineTopBar";
import { CheckoutResume } from "@/components/pwa/CheckoutResume";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your Story" };

export default async function TimelinePage() {
  const session = await requireSessionRedirect();
  const db = await getDb();
  const ports = getPorts();
  const profile = await getProfile(db, session.userId);
  const today = localParts(ports.clock.now(), profile?.timezone || "UTC").date;
  const timeline = await getTimeline(
    db,
    session.userId,
    ports.clock.now(),
    today,
  );
  return (
    <>
      <TimelineTopBar />
      <CheckoutResume />
      <TimelineView
        initial={timeline}
        today={today}
        priceLabel={getEnv().billing.priceLabel}
      />
      <div className="sticky bottom-0 z-20">
        <BottomNav />
      </div>
    </>
  );
}
