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
  "every day you've ever written stays",
  "pip can look back further than a week with you",
  "a keepsake card for each day, yours to share",
  "longer breathing moments when you need them",
];

/** True on both plans. It sat in the paid list, dimmed, under a heading that
 *  said "what pip+ adds" — the one free thing, styled as a locked feature. */
const ALWAYS_FREE = "exporting and deleting your story is free, on either plan";

export default async function SubscriptionPage() {
  const session = await requireSessionRedirect();
  const db = await getDb();
  const sub = await getSubscription(db, session.userId);
  const plus = isPlus(sub, getPorts().clock.now());
  const renew = sub?.currentPeriodEnd
    ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <main
      id="main"
      className="pt-safe pb-safe mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 py-6"
    >
      <BackLink href="/settings" className="mb-4">
        settings
      </BackLink>
      <h1 className="mb-4 font-display text-3xl">subscription</h1>

      <div className="rounded-card bg-surface p-6">
        <div className="text-sm text-fg-soft">you&apos;re on</div>
        <div className="font-display text-2xl">
          {plus ? "pip+" : "the free version"}
        </div>
        {plus && renew && (
          <div className="mt-1 text-sm text-fg-soft">
            {sub?.cancelAtPeriodEnd
              ? `yours until ${renew}`
              : `renews ${renew}`}
          </div>
        )}
        {!plus && (
          <div className="mt-1 text-sm text-fg-soft">
            your last seven days, kept
          </div>
        )}
      </div>

      {/* Headless, the list read as a claim about the current plan. It needs to
          say whose list it is — and on the free plan a filled checkmark next to
          something you do not have is the one dark-pattern-shaped thing here, so
          free sees plain dots and only pip+ sees ticks. */}
      <h2 className="mt-8 mb-4 text-xs font-bold uppercase tracking-wide text-fg-soft">
        {plus ? "what you have" : "what pip+ adds"}
      </h2>
      <ul className="flex flex-col gap-4">
        {INCLUDED.map((line) => (
          <li key={line} className="flex items-start gap-4 text-base">
            <span
              className={`mt-1 grid size-6 shrink-0 place-items-center rounded-pill ${plus ? "bg-cta text-cta-fg" : "bg-surface-2 text-fg-soft"}`}
            >
              {plus ? (
                <Icon icon={Check} size={14} />
              ) : (
                <span className="size-1.5 rounded-pill bg-fg-soft" />
              )}
            </span>
            <span className={plus ? "text-fg" : "text-fg-soft"}>{line}</span>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-fg-soft">{ALWAYS_FREE}</p>

      {/* mt-auto pushed ~180px of bare cream between the list and the ask, so the
          screen read as two disconnected halves. The list and its button are one
          object; the room goes underneath them, not through the middle. */}
      <div className="pb-safe sticky bottom-0 mt-8 bg-bg pt-4">
        <SubscriptionActions
          plus={plus}
          priceLabel={getEnv().billing.priceLabel}
        />
      </div>
    </main>
  );
}
