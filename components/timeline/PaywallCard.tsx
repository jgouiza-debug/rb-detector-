"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PipAvatar } from "@/components/pip/PipAvatar";
import { useToast } from "@/components/ui/Toast";

export function PaywallCard({ lockedCount, priceLabel, headingLevel = "h2" }: { lockedCount: number; priceLabel: string; headingLevel?: "h1" | "h2" }) {
  const Heading = headingLevel;
  const [label, setLabel] = useState(priceLabel);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/billing/price")
      .then((r) => r.json())
      .then((d: { label?: string }) => d.label && setLabel(d.label))
      .catch(() => {});
  }, []);

  async function checkout() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      if (!res.ok) throw new Error();
      const { url, sessionId } = (await res.json()) as { url: string; sessionId: string };
      try {
        localStorage.setItem("pip_checkout_pending", JSON.stringify({ sessionId, at: Date.now() }));
      } catch {
        /* ignore */
      }
      window.location.href = url;
    } catch {
      setBusy(false);
      toast("couldn't open checkout, try again");
    }
  }

  return (
    <section className="rounded-card bg-surface p-6 text-center shadow-2 ring-1 ring-line" aria-label="keep your whole story with pip+">
      <div className="mx-auto mb-4 grid size-14 place-items-center">
        <PipAvatar size={56} expression="happy" />
      </div>
      <Heading className="font-display text-2xl text-fg">keep your whole story</Heading>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-fg-soft">
        {lockedCount > 0 ? `there ${lockedCount === 1 ? "is one more day" : `are ${lockedCount} more days`} of you past the last week. ` : "the free version keeps your last seven days. "}
        pip+ keeps every day for as long as you want it, so pip can look back further than a week with you.
      </p>
      <Button full size="lg" className="mt-6" onClick={checkout} disabled={busy}>
        {busy ? "opening…" : `keep it all · ${label}`}
      </Button>
      <Link href="/timeline" className="tap mt-2 inline-flex items-center justify-center rounded-pill px-4 text-sm font-semibold text-fg-soft hover:bg-surface-2">
        not right now
      </Link>
      <p className="mt-2 text-xs text-fg-soft">cancel anytime · export and delete stay free, always</p>
    </section>
  );
}
