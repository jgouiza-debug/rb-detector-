"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default function DevPortal() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function act(action: "cancel_at_period_end" | "resume" | "expire_now") {
    setBusy(true);
    await fetch("/api/dev/billing/update", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
    router.push("/settings/subscription");
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center gap-4 px-6">
      <div className="rounded-card border border-line bg-surface p-6 shadow-1">
        <div className="text-xs font-semibold tracking-wide text-fg-soft">local mock portal</div>
        <h1 className="mt-2 font-display text-2xl">manage Pip+</h1>
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="soft" onClick={() => act("cancel_at_period_end")} disabled={busy} data-testid="portal-cancel">cancel at period end</Button>
          <Button variant="soft" onClick={() => act("resume")} disabled={busy}>resume</Button>
          <Button variant="danger" onClick={() => act("expire_now")} disabled={busy} data-testid="portal-expire">expire now (test)</Button>
        </div>
      </div>
    </main>
  );
}
