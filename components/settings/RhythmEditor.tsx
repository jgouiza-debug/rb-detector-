"use client";
import { useState } from "react";
import type { Prefs } from "@/lib/db/schema";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function RhythmEditor({ morningTime, eveningTime, prefs }: { morningTime: string | null; eveningTime: string | null; prefs: Prefs }) {
  const { toast } = useToast();
  const [morning, setMorning] = useState(morningTime ?? "08:30");
  const [evening, setEvening] = useState(eveningTime ?? "21:00");
  const [morningOn, setMorningOn] = useState(prefs.morningEnabled !== false && !!morningTime);
  const [eveningOn, setEveningOn] = useState(prefs.eveningEnabled !== false && !!eveningTime);
  const [haptics, setHaptics] = useState(prefs.haptics !== false);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        morningTime: morningOn ? morning : null,
        eveningTime: eveningOn ? evening : null,
        timezone,
        prefs: { morningEnabled: morningOn, eveningEnabled: eveningOn, haptics },
      }),
    });
    toast("rhythm saved");
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <Row label="morning nudge" on={morningOn} onToggle={() => setMorningOn((v) => !v)}>
        <input type="time" value={morning} onChange={(e) => setMorning(e.target.value)} disabled={!morningOn} aria-label="morning time" className="tap bg-transparent text-lg tabular-nums outline-none disabled:opacity-40" />
      </Row>
      <Row label="evening nudge" on={eveningOn} onToggle={() => setEveningOn((v) => !v)}>
        <input type="time" value={evening} onChange={(e) => setEvening(e.target.value)} disabled={!eveningOn} aria-label="evening time" className="tap bg-transparent text-lg tabular-nums outline-none disabled:opacity-40" />
      </Row>
      <Row label="gentle vibration in the breathing moment" on={haptics} onToggle={() => setHaptics((v) => !v)} />
      <Button className="mt-2" onClick={save} disabled={busy} full>save my rhythm</Button>
      <p className="mt-1 text-center text-xs text-fg-soft">nudges need notification permission, which you can allow from your browser.</p>
    </div>
  );
}

function Row({ label, on, onToggle, children }: { label: string; on: boolean; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-surface px-4 py-2 min-h-14">
      <span className="font-semibold text-fg">{label}</span>
      <div className="flex items-center gap-4">
        {children}
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          onClick={onToggle}
          className="tap -mr-2 grid place-items-center rounded-pill px-2"
        >
          <span aria-hidden="true" className={`relative block h-7 w-12 rounded-full transition-colors duration-150 ${on ? "bg-cta" : "bg-line"}`}>
            <span className={`absolute top-0.5 size-6 rounded-full bg-surface shadow transition-transform duration-150 ${on ? "translate-x-5" : "translate-x-0.5"}`} />
          </span>
        </button>
      </div>
    </div>
  );
}
