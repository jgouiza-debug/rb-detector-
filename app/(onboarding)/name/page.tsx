"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PipMascot } from "@/components/pip/PipMascot";
import { StepShell } from "@/components/onboarding/StepShell";
import { Button } from "@/components/ui/Button";

export default function NamePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function next() {
    setBusy(true);
    await fetch("/api/settings/profile", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: name.trim() || null }) });
    router.push("/focus");
  }

  return (
    <StepShell footer={<Button full size="lg" onClick={next} disabled={busy}>continue</Button>}>
      <PipMascot expression="listening" size={92} className="mx-auto" />
      <h1 className="text-center font-display text-3xl">what should i call you?</h1>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && next()}
        placeholder="your name"
        aria-label="your name"
        maxLength={60}
        className="w-full rounded-2xl border border-line bg-surface px-4 py-4 text-center text-xl text-fg outline-none focus-visible:outline-3 focus-visible:outline-ring"
      />
    </StepShell>
  );
}
