import { redirect } from "next/navigation";
import { getPorts } from "@/lib/ports";
import { getDb } from "@/lib/db/client";
import { getProfile } from "@/lib/db/repo/profiles";

export const dynamic = "force-dynamic";

/** Route the visitor: no session -> welcome; not onboarded -> onboarding; else -> thread. */
export default async function Home() {
  const session = await getPorts().auth.getSession();
  if (!session) redirect("/welcome");
  const db = await getDb();
  const profile = await getProfile(db, session.userId);
  if (!profile?.onboardedAt) redirect("/welcome");
  redirect("/thread");
}
