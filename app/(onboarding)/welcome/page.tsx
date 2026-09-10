"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { PipMascot } from "@/components/pip/PipMascot";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";

export default function WelcomePage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function begin() {
    setBusy(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const res = await fetch("/api/auth/anon", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ timezone }) });
      if (!res.ok) throw new Error("could not start");
      router.push("/name");
    } catch {
      setBusy(false);
    }
  }

  return (
    // Same shell as every other onboarding step, so the first screen and the
    // second sit their content and their button in exactly the same places.
    <StepShell
      footer={
        <>
          <Button full size="lg" onClick={begin} disabled={busy}>
            {busy ? "one sec…" : "hey pip"}
          </Button>
          <Link href="/sign-in" className="tap inline-flex items-center justify-center rounded-pill px-4 text-sm font-semibold text-fg-soft underline underline-offset-4">
            already have pip? sign in
          </Link>
        </>
      }
    >
      <PipMascot expression="listening" size={140} className="mx-auto" />
      <div className="space-y-2 text-center">
        <h1 className="font-display text-3xl">hey, i&apos;m pip</h1>
        <p className="text-lg text-fg-soft">a place to put your thoughts down. no rules, just talk to me whenever.</p>
        <p className="text-sm text-fg-soft">i&apos;m a companion, not a therapist. if things ever get heavy, help is one tap away.</p>
      </div>
    </StepShell>
  );
}
