"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PipMascot } from "@/components/pip/PipMascot";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";

export default function RhythmPage() {
  const router = useRouter();
  const [morning, setMorning] = useState("08:30");
  const [evening, setEvening] = useState("21:00");
  const [busy, setBusy] = useState(false);

  async function save(withTimes: boolean) {
    setBusy(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ morningTime: withTimes ? morning : null, eveningTime: withTimes ? evening : null, timezone, prefs: { morningEnabled: withTimes, eveningEnabled: withTimes } }),
    });
    router.push("/notify");
  }

  return (
    <StepShell
      step={3}
      total={4}
      footer={
        <>
          <Button full size="lg" onClick={() => save(true)} disabled={busy}>set my rhythm</Button>
          <Button full variant="ghost" onClick={() => save(false)} disabled={busy}>skip for now</Button>
        </>
      }
    >
      <PipMascot expression="cozy" size={92} className="mx-auto" />
      <h1 className="text-center font-display text-3xl">when should i check in?</h1>
      <p className="text-center text-fg-soft">gentle nudges, morning and evening. never nagging. you can change these anytime.</p>
      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-2 min-h-12">
          <span className="font-semibold">morning</span>
          <input type="time" value={morning} onChange={(e) => setMorning(e.target.value)} aria-label="morning check-in time" className="tap bg-transparent text-lg text-fg outline-none" />
        </label>
        <label className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-2 min-h-12">
          <span className="font-semibold">evening</span>
          <input type="time" value={evening} onChange={(e) => setEvening(e.target.value)} aria-label="evening check-in time" className="tap bg-transparent text-lg text-fg outline-none" />
        </label>
      </div>
    </StepShell>
  );
}
