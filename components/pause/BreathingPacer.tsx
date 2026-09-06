"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { PipMascot } from "@/components/pip/PipMascot";
import { useBreathing } from "@/hooks/useBreathing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BOX, FOUR78, type BreathPattern } from "@/lib/breath/patterns";
import { BreathRing } from "./BreathRing";
import { PatternToggle } from "./PatternToggle";

const PHASE_COPY: Record<string, string> = {
  "breathe in": "filling softly, like warm morning light",
  hold: "hold it gently",
  "breathe out": "let it all go, slow",
  "hold in": "rest here a moment",
};

export function BreathingPacer({ sessionSeconds, haptics, plus }: { sessionSeconds: number; haptics: boolean; plus: boolean }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [pattern, setPattern] = useState<BreathPattern>(BOX);
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(sessionSeconds);
  const { state, restart } = useBreathing(pattern, seconds, { running, haptics });

  const scaleStyle = reduce
    ? { transform: `scale(${state.scale > 1.09 ? 1.12 : 1})`, transition: "transform 200ms ease" }
    : { ["--breath-scale" as string]: String(state.scale), transform: "scale(var(--breath-scale))" };

  useEffect(() => {
    if (state.done) {
      fetch("/api/pause/complete", { method: "POST" }).finally(() => router.push("/thread"));
    }
  }, [state.done, router]);

  function toggle() {
    setPattern((p) => (p.key === "box" ? FOUR78 : BOX));
    restart();
  }
  function longer() {
    setSeconds(180);
    restart();
  }

  const mins = Math.floor(state.sessionProgress * seconds) / 60;
  const total = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  const elapsed = Math.floor(state.sessionProgress * seconds);
  const clock = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  void mins;

  return (
    <main className="pt-safe pb-safe relative flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-gradient-to-b from-surface to-bg px-6 text-center" style={{ ["--motion-scale" as string]: "1.6" }}>
      <button onClick={() => router.push("/thread")} aria-label="close" className="tap absolute right-4 top-[max(1rem,env(safe-area-inset-top))] grid place-items-center rounded-full bg-surface/70 text-fg">
        <Icon icon={X} size={20} />
      </button>
      <div className="text-xs font-bold uppercase tracking-widest text-fg-soft">mindful pause</div>

      <div className="relative grid place-items-center" style={{ width: 240, height: 240 }}>
        <BreathRing state={state} size={240} />
        <div className="absolute" style={scaleStyle}>
          <PipMascot expression="cozy" size={120} idle={false} />
        </div>
      </div>

      <div aria-live="polite" className="space-y-1">
        <h1 className="font-reading text-3xl">{state.phaseName}…</h1>
        <p className="text-fg-soft">{PHASE_COPY[state.phaseName]}</p>
        <p className="font-display text-4xl tabular-nums" aria-hidden="true">{state.secondsLeft}</p>
      </div>

      <div className="text-sm text-fg-soft tabular-nums">{clock} / {total}</div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button full size="lg" onClick={() => router.push("/thread")}>i feel ready</Button>
        <PatternToggle pattern={pattern} onToggle={toggle} />
        {plus && seconds === 90 && (
          <button onClick={longer} className="text-sm font-semibold text-fg-soft underline">make it a longer 3-minute pause</button>
        )}
      </div>
      {!running && <span className="sr-only">paused</span>}
      <button onClick={() => setRunning((r) => !r)} className="sr-only">toggle</button>
    </main>
  );
}
