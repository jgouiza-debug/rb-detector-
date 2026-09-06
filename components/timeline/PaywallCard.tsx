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
    <section className="rounded-card bg-gradient-to-b from-sunlight to-honey p-6 text-center text-ink shadow-sm" aria-label="unlock pip+">
      <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-cream/70">
        <Icon icon={BookHeart} size={24} />
      </div>
      <h2 className="font-display text-2xl">keep your whole story, forever 📖</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm text-ink/80">
        {lockedCount > 0 ? `${lockedCount} more day${lockedCount === 1 ? "" : "s"} waiting beyond your 7-day window. ` : ""}
        unlock your full timeline, deeper conversations, and your keepsake export.
      </p>
      <Button variant="strong" full size="lg" className="mt-4" onClick={checkout} disabled={busy}>
        {busy ? "opening…" : `Unlock with Pip+ (${label})`}
      </Button>
      <p className="mt-2 text-xs text-ink/80">cancel anytime · your data stays completely private</p>
    </section>
  );
}
