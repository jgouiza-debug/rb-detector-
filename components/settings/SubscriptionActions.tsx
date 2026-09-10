"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function SubscriptionActions({ plus, priceLabel }: { plus: boolean; priceLabel: string }) {
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  async function checkout() {
    setBusy(true);
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    if (res.ok) {
      const { url, sessionId } = (await res.json()) as { url: string; sessionId: string };
      try {
        localStorage.setItem("pip_checkout_pending", JSON.stringify({ sessionId, at: Date.now() }));
      } catch {}
      window.location.href = url;
    } else {
      setBusy(false);
      toast("couldn't open checkout");
    }
  }
  async function portal() {
    setBusy(true);
    const res = await fetch("/api/billing/portal", { method: "POST" });
    if (res.ok) window.location.href = (await res.json()).url;
    else {
      setBusy(false);
      toast("couldn't open the portal");
    }
  }
  async function refresh() {
    setBusy(true);
    await fetch("/api/billing/refresh", { method: "POST" });
    toast("status refreshed");
    setTimeout(() => window.location.reload(), 500);
  }

  return (
    <div className="flex flex-col gap-2">
      {plus ? (
        <Button variant="soft" full onClick={portal} disabled={busy}>manage subscription</Button>
      ) : (
        <Button full size="lg" onClick={checkout} disabled={busy}>keep it all · {priceLabel}</Button>
      )}
      {/* Only meaningful to someone waiting on a late webhook. Showing it to a
          free user who has never paid reads as "we lose payments sometimes". */}
      {plus && (
        <Button variant="ghost" full onClick={refresh} disabled={busy}>refresh my plan</Button>
      )}
    </div>
  );
}
