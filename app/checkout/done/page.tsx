import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { applyBillingEvent } from "@/lib/billing/applyEvent";
import { getPorts } from "@/lib/ports";
import { PipMascot } from "@/components/pip/PipMascot";

export const dynamic = "force-dynamic";
export const metadata = { title: "you're all set" };

/** Public. Syncs the checkout session, then routes signed-in users back to the timeline. */
export default async function CheckoutDonePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
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
    <main
      id="main"
      className="pt-safe pb-safe mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <PipMascot expression="happy" size={120} />
      <h1 className="font-display text-3xl">you&apos;re all set</h1>
      <p className="text-fg-soft">
        welcome to pip+. head back to pip to see your whole story.
      </p>
      {/* The one thing to do here was a 24px underlined link. It is the screen's
          only action, so it is shaped like one. */}
      <Link
        href="/timeline"
        className={buttonClasses({ full: true, className: "mt-2" })}
      >
        open pip
      </Link>
    </main>
  );
}
