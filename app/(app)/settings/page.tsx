import { Bell, CreditCard, Database, Info, User } from "lucide-react";
import { BackLink } from "@/components/ui/BackLink";
import { getDb } from "@/lib/db/client";
import { isPlus } from "@/lib/billing/entitlements";
import { getProfile } from "@/lib/db/repo/profiles";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { getPorts } from "@/lib/ports";
import { SettingRow } from "@/components/settings/SettingRow";
import { HelpNowCard } from "@/components/settings/HelpNowCard";
import { requireSessionRedirect } from "@/lib/util/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await requireSessionRedirect();
  const db = await getDb();
  const profile = await getProfile(db, session.userId);
  const sub = await getSubscription(db, session.userId);
  const plus = isPlus(sub, getPorts().clock.now());

  return (
    <main
      id="main"
      className="pt-safe pb-safe mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 py-6"
    >
      <BackLink href="/thread" className="mb-4">
        back to pip
      </BackLink>
      <h1 className="mb-4 font-display text-3xl">settings</h1>
      <div className="mb-4">
        <HelpNowCard />
      </div>
      <section className="flex flex-col gap-2" aria-labelledby="settings-you">
        <h2
          id="settings-you"
          className="px-2 text-xs font-semibold text-fg-soft"
        >
          you
        </h2>
        <SettingRow
          href="/settings/account"
          icon={User}
          title="account"
          subtitle={
            profile?.email ??
            (session.isAnonymous
              ? "save your account with an email"
              : "signed in")
          }
        />
        <SettingRow
          href="/settings/subscription"
          icon={CreditCard}
          title="subscription"
          subtitle={plus ? "Pip+" : "free"}
        />
      </section>

      <section
        className="mt-6 flex flex-col gap-2"
        aria-labelledby="settings-rhythm"
      >
        <h2
          id="settings-rhythm"
          className="px-2 text-xs font-semibold text-fg-soft"
        >
          how pip reaches you
        </h2>
        <SettingRow
          href="/settings/notifications"
          icon={Bell}
          title="your rhythm & nudges"
          subtitle={
            profile?.morningTime || profile?.eveningTime
              ? "gentle check-ins on"
              : "check-ins off"
          }
        />
      </section>

      <section
        className="mt-6 flex flex-col gap-2"
        aria-labelledby="settings-data"
      >
        <h2
          id="settings-data"
          className="px-2 text-xs font-semibold text-fg-soft"
        >
          your words
        </h2>
        <SettingRow
          href="/settings/data"
          icon={Database}
          title="your data"
          subtitle="export or delete everything"
        />
        <SettingRow
          href="/settings/about"
          icon={Info}
          title="about pip & privacy"
        />
      </section>
    </main>
  );
}
