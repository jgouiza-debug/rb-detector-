import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { isPlus } from "@/lib/billing/entitlements";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { getPorts } from "@/lib/ports";
import { Icon } from "@/components/ui/Icon";
import { requireSessionRedirect } from "@/lib/util/session";
import { SubscriptionActions } from "@/components/settings/SubscriptionActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "subscription" };

export default async function SubscriptionPage() {
  const session = await requireSessionRedirect();
  const db = await getDb();
  const sub = await getSubscription(db, session.userId);
  const plus = isPlus(sub, getPorts().clock.now());
  const renew = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

  return (
    <main className="pt-safe pb-safe mx-auto max-w-md px-5 py-6">
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-soft"><Icon icon={ArrowLeft} size={16} /> settings</Link>
      <h1 className="mb-4 font-display text-3xl">subscription</h1>
      <div className="rounded-card bg-surface p-5">
        <div className="text-sm text-fg-soft">current plan</div>
        <div className="font-display text-2xl">{plus ? "Pip+" : "free"}</div>
        {plus && renew && <div className="mt-1 text-sm text-fg-soft">{sub?.cancelAtPeriodEnd ? `access until ${renew}` : `renews ${renew}`}</div>}
      </div>
      <SubscriptionActions plus={plus} priceLabel={getEnv().billing.priceLabel} />
    </main>
  );
}
