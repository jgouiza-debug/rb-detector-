"use client";
import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/** Shown after checkout when the Stripe email couldn't be auto-attached, so a
 * paying user can secure Pip+ on any device. Polls /api/me for needsEmailLink. */
export function EmailLinkSheet() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d: { needsEmailLink?: boolean; email?: string | null }) => {
        if (d.needsEmailLink) {
          setOpen(true);
          if (d.email) setEmail(d.email);
        }
      })
      .catch(() => {});
  }, []);

  async function send() {
    setBusy(true);
    await fetch("/api/auth/link/start", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    setStage("code");
    setBusy(false);
  }
  async function verify() {
    setBusy(true);
    const res = await fetch("/api/auth/link/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, code }) });
    if (res.ok) {
      toast("saved — pip+ is safe on any device 🌱", "warm");
      setOpen(false);
    } else toast("that code didn't work");
    setBusy(false);
  }

  return (
    <Sheet open={open} onClose={() => setOpen(false)} title="keep pip+ on any device" dismissible={false}>
      <p className="mb-4 text-fg-soft">confirm your email so your subscription follows you if you switch phones or clear your browser.</p>
      {stage === "email" ? (
        <>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" aria-label="email" className="mb-3 w-full rounded-2xl border border-line bg-surface px-4 py-3 outline-none focus-visible:outline-3 focus-visible:outline-ring" />
          <Button full onClick={send} disabled={busy || !email.includes("@")}>send me a code</Button>
        </>
      ) : (
        <>
          <input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" aria-label="code" className="mb-3 w-full rounded-2xl border border-line bg-surface px-4 py-3 text-center text-xl tracking-[0.3em] outline-none focus-visible:outline-3 focus-visible:outline-ring" />
          <Button full onClick={verify} disabled={busy || code.length < 4}>confirm</Button>
        </>
      )}
    </Sheet>
  );
}
