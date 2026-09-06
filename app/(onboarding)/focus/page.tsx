"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PipMascot } from "@/components/pip/PipMascot";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";

const OPTIONS = ["processing a lot", "building a habit", "remembering my days", "just curious"];

export default function FocusPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  function toggle(v: string) {
    setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }
  async function next() {
    setBusy(true);
    await fetch("/api/settings/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ focus: selected }) });
    router.push("/rhythm");
  }

  return (
    <StepShell
      step={2}
      total={4}
      footer={
        <>
          <Button full size="lg" onClick={next} disabled={busy}>continue</Button>
          <Button full variant="ghost" onClick={next} disabled={busy}>skip</Button>
        </>
      }
    >
      <PipMascot expression="thinking" size={92} className="mx-auto" />
      <h1 className="text-center font-display text-3xl">what&apos;s on your mind these days?</h1>
      <p className="text-center text-fg-soft">pick any that fit, or none. it just helps me meet you where you are.</p>
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="what brings you here">
        {OPTIONS.map((o) => (
          <Chip key={o} role="checkbox" selected={selected.includes(o)} onClick={() => toggle(o)}>
            {o}
          </Chip>
        ))}
      </div>
    </StepShell>
  );
}
