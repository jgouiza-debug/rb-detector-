import { redirect } from "next/navigation";
import { getDb } from "@/lib/db/client";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { BottomNav } from "@/components/ui/BottomNav";
import { ToastProvider } from "@/components/ui/Toast";

export const dynamic = "force-dynamic";

/** The real auth + onboarding gate (proxy.ts only does a fast cookie check). */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getPorts().auth.getSession();
  if (!session) redirect("/welcome");
  const db = await getDb();
  const profile = await getProfile(db, session.userId);
  if (!profile?.onboardedAt) redirect("/welcome");

  return (
    <ToastProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <div id="main" className="flex flex-1 flex-col">
          {children}
        </div>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
