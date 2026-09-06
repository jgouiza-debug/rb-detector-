import { Bell, Clock, CreditCard, Database, Info, LogOut, User } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { isPlus } from "@/lib/billing/entitlements";
import { getProfile } from "@/lib/db/repo/profiles";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { getPorts } from "@/lib/ports";
import { SettingRow } from "@/components/settings/SettingRow";
import { HelpNowCard } from "@/components/settings/HelpNowCard";
import { SignOutButton } from "@/components/settings/SignOutButton";
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
    <main className="pt-safe pb-safe mx-auto max-w-md px-5 py-6">
      <h1 className="mb-4 font-display text-3xl">settings</h1>
      <div className="mb-4"><HelpNowCard /></div>
      <div className="flex flex-col gap-2">
        <SettingRow href="/settings/account" icon={User} title="account" subtitle={profile?.email ?? (session.isAnonymous ? "save your account with an email" : "signed in")} />
        <SettingRow href="/settings/subscription" icon={CreditCard} title="subscription" subtitle={plus ? "Pip+" : "free"} />
        <SettingRow href="/settings/notifications" icon={Bell} title="your rhythm & nudges" subtitle={profile?.morningTime || profile?.eveningTime ? "gentle check-ins on" : "check-ins off"} />
        <SettingRow href="/settings/data" icon={Database} title="your data" subtitle="export or delete everything" />
        <SettingRow href="/settings/about" icon={Info} title="about pip & privacy" />
      </div>
      <div className="mt-6">
        <SignOutButton />
      </div>
    </main>
  );
}

void Clock;
void LogOut;
