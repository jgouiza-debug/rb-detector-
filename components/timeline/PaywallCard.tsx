"use client";
import { useEffect, useState } from "react";
import { BookHeart } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function PaywallCard({ lockedCount, priceLabel }: { lockedCount: number; priceLabel: string }) {
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
    <section className="rounded-card bg-surface p-7 text-center shadow-2 ring-1 ring-line" aria-label="unlock pip+">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-cta/15 text-amber-ink">
        <Icon icon={BookHeart} size={26} />
      </div>
      <h2 className="font-display text-2xl text-fg">keep your whole story</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-fg-soft">
        {lockedCount > 0 ? `${lockedCount} more day${lockedCount === 1 ? "" : "s"} waiting beyond your 7-day window. ` : ""}
        unlock your full timeline, deeper conversations, and shareable keepsake cards.
      </p>
      <Button variant="strong" full size="lg" className="mt-5" onClick={checkout} disabled={busy}>
        {busy ? "opening…" : `Unlock with Pip+ (${label})`}
      </Button>
      <p className="mt-3 text-xs text-fg-soft">cancel anytime · your export and data stay free and yours</p>
    </section>
  );
}
