"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PipMascot } from "@/components/pip/PipMascot";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { subscribeToPush } from "@/components/pwa/usePush";

export default function NotifyPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function finish(allow: boolean) {
    setBusy(true);
    if (allow) {
      try {
        await subscribeToPush();
      } catch {
        /* permission denied is fine */
      }
    }
    await fetch("/api/onboarding/complete", { method: "POST" });
    router.push("/thread");
  }

  return (
    <StepShell
      footer={
        <>
          <Button full size="lg" onClick={() => finish(true)} disabled={busy}>yes, gently check in</Button>
          <Button full variant="ghost" onClick={() => finish(false)} disabled={busy}>not now</Button>
        </>
      }
    >
      <PipMascot expression="happy" size={92} className="mx-auto" />
      <h1 className="text-center font-display text-3xl">so i can gently check in</h1>
      <p className="text-center text-fg-soft">i&apos;ll only send your morning and evening nudge, plus a soft note when your day&apos;s ready to look back on. that&apos;s it.</p>
    </StepShell>
  );
}
