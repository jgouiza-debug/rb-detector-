"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PipMascot } from "@/components/pip/PipMascot";
import { useBreathing } from "@/hooks/useBreathing";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { BOX, FOUR78, type BreathPattern } from "@/lib/breath/patterns";
import { BreathRing } from "./BreathRing";
import { PatternToggle } from "./PatternToggle";

const PHASE_COPY: Record<string, string> = {
  "breathe in": "slow, through your nose",
  hold: "and hold",
  "breathe out": "let it out, slower than you think",
  "hold in": "rest here a moment",
};

export function BreathingPacer({
  sessionSeconds,
  haptics,
  plus,
}: {
  sessionSeconds: number;
  haptics: boolean;
  plus: boolean;
}) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [pattern, setPattern] = useState<BreathPattern>(BOX);
  const [running, setRunning] = useState(true);
  const [seconds, setSeconds] = useState(sessionSeconds);
  const { state, restart } = useBreathing(pattern, seconds, {
    running,
    haptics,
  });

  // Reduced motion eases the breath way down rather than switching it off — the
  // pacer *is* the content here. `.breath-eased` is the one deliberate exception
  // to the blanket reduced-motion rule in globals.css.
  const scaleStyle = reduce
    ? { transform: `scale(${state.scale > 1.09 ? 1.06 : 1})` }
    : {
        ["--breath-scale" as string]: String(state.scale),
        transform: "scale(var(--breath-scale))",
      };

  useEffect(() => {
    if (state.done) {
      fetch("/api/pause/complete", { method: "POST" }).finally(() =>
        router.push("/thread"),
      );
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
    <main
      id="main"
      className="pt-safe pb-safe relative flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-bg px-6 text-center"
      style={{
        ["--motion-scale" as string]: "1.6",
        ["--breath-ease" as string]: "1.2s",
      }}
    >
      <div
        className="relative grid place-items-center"
        style={{ width: 240, height: 240 }}
      >
        <BreathRing state={state} size={240} />
        <div
          className={
            reduce ? "breath-eased absolute transition-transform" : "absolute"
          }
          style={scaleStyle}
        >
          <PipMascot expression="cozy" size={120} idle={false} />
        </div>
      </div>

      {/* The serif is the reading voice, scoped to the memory surfaces; the pause
          screen speaks in the display face. And the phase is announced once per
          change through a dedicated live region, not by re-reading the heading. */}
      <div className="space-y-2">
        <h1 className="font-display text-3xl">{state.phaseName}…</h1>
        <p className="text-fg-soft">{PHASE_COPY[state.phaseName]}</p>
      </div>
      <p className="sr-only">
        {clock} of {total}
      </p>

      <div className="flex w-full max-w-xs flex-col gap-4">
        <Button
          variant="soft"
          full
          size="lg"
          onClick={() => router.push("/thread")}
        >
          i feel ready
        </Button>
        <PatternToggle pattern={pattern} onToggle={toggle} />
        <span aria-live="polite" aria-atomic="true" className="sr-only">
          {running ? `${state.phaseName}` : "paused"}
        </span>
        {plus && seconds === 90 && (
          <button
            onClick={longer}
            className="text-sm font-semibold text-fg-soft underline"
          >
            make it a longer 3-minute pause
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => setRunning((r) => !r)}
        aria-pressed={!running}
        className="tap inline-flex items-center justify-center rounded-pill px-4 text-sm font-semibold text-fg-soft transition-colors duration-150 hover:bg-surface active:bg-line/40"
      >
        {running ? "pause" : "keep going"}
      </button>
    </main>
  );
}
