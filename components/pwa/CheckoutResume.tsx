"use client";
import { useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

/**
 * After returning from Stripe (especially in an installed iOS PWA, where the
 * success page opens in an isolated in-app browser), re-sync on focus so the
 * paywall unlocks without the user reloading.
 */
export function CheckoutResume() {
  const { toast } = useToast();
  useEffect(() => {
    async function check() {
      let pending: { sessionId: string; at: number } | null = null;
      try {
        const raw = localStorage.getItem("pip_checkout_pending");
        pending = raw ? JSON.parse(raw) : null;
      } catch {
        return;
      }
      if (!pending || Date.now() - pending.at > 24 * 3600_000) return;
      try {
        await fetch("/api/billing/sync", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sessionId: pending.sessionId }) });
        const me = await (await fetch("/api/me")).json();
        if (me.plan === "plus") {
          localStorage.removeItem("pip_checkout_pending");
          toast("welcome to pip+", "warm");
          setTimeout(() => window.location.reload(), 900);
        }
      } catch {
        /* try again on next focus */
      }
    }
    const onFocus = () => check();
    window.addEventListener("visibilitychange", onFocus);
    window.addEventListener("focus", onFocus);
    window.addEventListener("pageshow", onFocus);
    check();
    return () => {
      window.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pageshow", onFocus);
    };
  }, [toast]);
  return null;
}
