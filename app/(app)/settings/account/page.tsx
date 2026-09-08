import { getDb } from "@/lib/db/client";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { BackLink } from "@/components/ui/BackLink";
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
    <main id="main" className="pt-safe pb-safe mx-auto w-full max-w-md px-4 py-6">
      <BackLink href="/settings" className="mb-4">settings</BackLink>
      <h1 className="mb-4 font-display text-3xl">account</h1>
      <AccountEditor name={profile?.name ?? ""} email={profile?.email ?? null} isAnonymous={session.isAnonymous} />
    </main>
  );
}
