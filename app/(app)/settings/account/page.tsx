import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/lib/db/client";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { Icon } from "@/components/ui/Icon";
import { requireSessionRedirect } from "@/lib/util/session";
import { AccountEditor } from "@/components/settings/AccountEditor";

export const dynamic = "force-dynamic";
export const metadata = { title: "account" };

export default async function AccountPage() {
  const session = await requireSessionRedirect();
  const db = await getDb();
  const profile = await getProfile(db, session.userId);
  void getPorts;
  return (
    <main className="pt-safe pb-safe mx-auto max-w-md px-5 py-6">
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-soft"><Icon icon={ArrowLeft} size={16} /> settings</Link>
      <h1 className="mb-4 font-display text-3xl">account</h1>
      <AccountEditor name={profile?.name ?? ""} email={profile?.email ?? null} isAnonymous={session.isAnonymous} />
    </main>
  );
}
