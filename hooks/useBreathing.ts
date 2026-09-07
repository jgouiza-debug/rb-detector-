"use client";
import { useEffect, useRef, useState } from "react";
import { breathAt, type BreathState } from "@/lib/breath/engine";
import type { BreathPattern } from "@/lib/breath/patterns";

/**
 * One rAF loop that pauses on tab-hide and vibrates on phase change (optional).
 * Under reduced motion it steps at 1Hz instead of animating every frame.
 */
export function useBreathing(pattern: BreathPattern, sessionSeconds: number, opts: { running: boolean; haptics: boolean }): { state: BreathState; restart: () => void } {
  const [state, setState] = useState<BreathState>(() => breathAt(0, pattern, sessionSeconds));
  const start = useRef<number | null>(null);
  const elapsedBeforePause = useRef(0);
  const lastPhase = useRef(-1);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!opts.running) return;
    let cancelled = false;

    function tick(now: number) {
      if (cancelled) return;
      if (start.current === null) start.current = now;
      const elapsed = elapsedBeforePause.current + (now - start.current);
      const s = breathAt(elapsed, pattern, sessionSeconds);
      setState(s);
      const active = typeof navigator !== "undefined" && (!("userActivation" in navigator) || (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive);
      if (opts.haptics && active && s.phaseIndex !== lastPhase.current && typeof navigator !== "undefined" && "vibrate" in navigator) {
        lastPhase.current = s.phaseIndex;
        try {
          navigator.vibrate(20);
        } catch {
          /* ignore */
        }
      }
      if (!s.done) rafRef.current = requestAnimationFrame(tick);
    }

    function onVisibility() {
      if (document.hidden) {
        if (start.current !== null) {
          elapsedBeforePause.current += performance.now() - start.current;
          start.current = null;
        }
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [opts.running, opts.haptics, pattern, sessionSeconds]);

  function restart() {
    start.current = null;
    elapsedBeforePause.current = 0;
    lastPhase.current = -1;
    setState(breathAt(0, pattern, sessionSeconds));
  }

  return { state, restart };
}
