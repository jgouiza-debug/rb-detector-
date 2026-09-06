import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { getProfile } from "@/lib/db/repo/profiles";
import { Icon } from "@/components/ui/Icon";
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
    <main className="pt-safe pb-safe mx-auto max-w-md px-5 py-6">
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-soft"><Icon icon={ArrowLeft} size={16} /> settings</Link>
      <h1 className="mb-1 font-display text-3xl">your rhythm</h1>
      <p className="mb-4 text-fg-soft">gentle check-ins, morning and evening. never nagging.</p>
      <RhythmEditor
        morningTime={profile?.morningTime ?? null}
        eveningTime={profile?.eveningTime ?? null}
        prefs={profile?.prefs ?? {}}
      />
      <div className="mt-6">
        <h2 className="mb-2 font-display text-xl">notifications</h2>
        <NotifyControls />
      </div>
      <div className="mt-6">
        <h2 className="mb-2 font-display text-xl">appearance</h2>
        <ThemeToggle />
      </div>
    </main>
  );
}
