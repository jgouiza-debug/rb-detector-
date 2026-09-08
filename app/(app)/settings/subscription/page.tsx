import { Check } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { isPlus } from "@/lib/billing/entitlements";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { getPorts } from "@/lib/ports";
import { Icon } from "@/components/ui/Icon";
import { BackLink } from "@/components/ui/BackLink";
import { requireSessionRedirect } from "@/lib/util/session";
import { SubscriptionActions } from "@/components/settings/SubscriptionActions";

export const dynamic = "force-dynamic";
export const metadata = { title: "subscription" };

/** What the money actually buys, in Pip's words — the same words the paywall uses. */
const INCLUDED = [
  "every day you've ever written, kept",
  "pip can look back further than a week with you",
  "a keepsake card for each day, yours to share",
  "longer breathing moments when you need them",
  "export and delete stay free, always",
];

export default async function SubscriptionPage() {
  const session = await requireSessionRedirect();
  const db = await getDb();
  const sub = await getSubscription(db, session.userId);
  const plus = isPlus(sub, getPorts().clock.now());
  const renew = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : null;

  return (
    <main id="main" className="pt-safe pb-safe mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 py-6">
      <BackLink href="/settings" className="mb-4">settings</BackLink>
      <h1 className="mb-4 font-display text-3xl">subscription</h1>

      <div className="rounded-card bg-surface p-6">
        <div className="text-sm text-fg-soft">you&apos;re on</div>
        <div className="font-display text-2xl">{plus ? "pip+" : "the free version"}</div>
        {plus && renew && <div className="mt-1 text-sm text-fg-soft">{sub?.cancelAtPeriodEnd ? `yours until ${renew}` : `renews ${renew}`}</div>}
        {!plus && <div className="mt-1 text-sm text-fg-soft">your last seven days, kept</div>}
      </div>

      <ul className="mt-6 flex flex-col gap-4">
        {INCLUDED.map((line) => (
          <li key={line} className="flex items-start gap-4 text-base">
            <span className={`mt-1 grid size-6 shrink-0 place-items-center rounded-full ${plus ? "bg-cta text-cta-fg" : "bg-surface-2 text-fg-soft"}`}>
              <Icon icon={Check} size={14} />
            </span>
            <span className={plus ? "text-fg" : "text-fg-soft"}>{line}</span>
          </li>
        ))}
      </ul>

      <div className="pb-safe sticky bottom-0 mt-auto bg-bg pt-8">
        <SubscriptionActions plus={plus} priceLabel={getEnv().billing.priceLabel} />
      </div>
    </main>
  );
}
