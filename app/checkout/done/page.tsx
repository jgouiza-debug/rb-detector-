import { redirect } from "next/navigation";
import Link from "next/link";
import { applyBillingEvent } from "@/lib/billing/applyEvent";
import { getPorts } from "@/lib/ports";
import { PipMascot } from "@/components/pip/PipMascot";

export const dynamic = "force-dynamic";
export const metadata = { title: "you're all set" };

/** Public. Syncs the checkout session, then routes signed-in users back to the timeline. */
export default async function CheckoutDonePage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  if (session_id) {
    try {
      const ev = await getPorts().billing.syncCheckoutSession(session_id);
      if (ev) await applyBillingEvent(ev);
    } catch {
      /* the webhook and resume paths cover this */
    }
  }
  const session = await getPorts().auth.getSession();
  if (session) redirect("/timeline?checkout=success");

  return (
    <main id="main" className="pt-safe mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <PipMascot expression="happy" size={120} />
      <h1 className="font-display text-3xl">you&apos;re all set 🌱</h1>
      <p className="text-fg-soft">welcome to pip+. head back to pip to see your whole story.</p>
      <Link href="/timeline" className="font-semibold text-fg underline underline-offset-4">open pip</Link>
    </main>
  );
}
