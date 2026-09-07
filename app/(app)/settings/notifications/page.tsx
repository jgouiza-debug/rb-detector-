import { getDb } from "@/lib/db/client";
import { getProfile } from "@/lib/db/repo/profiles";
import { BackLink } from "@/components/ui/BackLink";
import { requireSessionRedirect } from "@/lib/util/session";
import { RhythmEditor } from "@/components/settings/RhythmEditor";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { NotifyControls } from "@/components/settings/NotifyControls";

export const dynamic = "force-dynamic";
export const metadata = { title: "your rhythm" };

export default async function NotificationsPage() {
  const session = await requireSessionRedirect();
  const db = await getDb();
  const profile = await getProfile(db, session.userId);
  return (
    <main className="pt-safe pb-safe mx-auto w-full max-w-md px-4 py-6">
      <BackLink href="/settings" className="mb-4">settings</BackLink>
      <h1 className="mb-1 font-display text-3xl">your rhythm</h1>
      <p className="mb-4 text-fg-soft">gentle check-ins, morning and evening. never nagging.</p>
      <RhythmEditor
        morningTime={profile?.morningTime ?? null}
        eveningTime={profile?.eveningTime ?? null}
        prefs={profile?.prefs ?? {}}
      />
      <div className="mt-6">
        <h2 className="mb-2 font-display text-lg">notifications</h2>
        <NotifyControls />
      </div>
      <div className="mt-6">
        <h2 className="mb-2 font-display text-lg">appearance</h2>
        <ThemeToggle />
      </div>
    </main>
  );
}
