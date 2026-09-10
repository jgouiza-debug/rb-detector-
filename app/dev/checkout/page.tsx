"use client";
import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

/** Local stand-in for the hosted Stripe Checkout page. Feeds the real applyBillingEvent. */
export default function DevCheckout({ searchParams }: { searchParams: Promise<{ sid?: string; uid?: string; success?: string; cancel?: string }> }) {
  const sp = use(searchParams);
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    await fetch("/api/dev/billing/complete", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({}) });
    const success = sp.success ? decodeURIComponent(sp.success).replace("{CHECKOUT_SESSION_ID}", sp.sid ?? "cs_local") : "/checkout/done";
    router.push(success.startsWith("http") ? new URL(success).pathname + new URL(success).search : success);
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center gap-6 px-6">
      <div className="rounded-card border border-line bg-surface p-6 text-center shadow-1">
        <div className="text-xs font-semibold tracking-wide text-fg-soft">local mock checkout</div>
        <h1 className="mt-2 font-display text-2xl">Pip+</h1>
        <p className="text-3xl font-bold text-fg">$4.99<span className="text-base font-normal text-fg-soft">/mo</span></p>
        <p className="mt-1 text-sm text-fg-soft">this is a local stand-in for Stripe. no card, no charge.</p>
        <Button full size="lg" className="mt-6" onClick={pay} disabled={busy} data-testid="dev-pay">
          {busy ? "…" : "Pay $4.99"}
        </Button>
        <button onClick={() => router.push("/timeline?checkout=cancel")} className="mt-4 w-full text-sm font-semibold text-fg-soft">cancel</button>
      </div>
    </main>
  );
}
