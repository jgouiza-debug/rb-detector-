import { cycleSeconds, type BreathPattern, type PhaseName } from "./patterns";

export interface BreathState {
  phaseIndex: number;
  phaseName: PhaseName;
  /** 0..1 progress within the current phase. */
  phaseProgress: number;
  /** whole seconds left in the current phase (ceil, min 1 while active). */
  secondsLeft: number;
  /** target scale for the mascot / ring, 1.0 (empty) .. 1.18 (full). */
  scale: number;
  /** 0..1 progress through the whole session. */
  sessionProgress: number;
  /** 0..1 progress through the current breath cycle (all phases). */
  cycleProgress: number;
  cycle: number;
  done: boolean;
}

const MIN_SCALE = 1;
const MAX_SCALE = 1.18;

/**
 * Pure breath engine. Given elapsed ms, the pattern, and the session length,
 * returns exactly what to render — no timers, no DOM. Drives the ring, the
 * phase word, the countdown, the mascot size, the session progress, and the
 * frame of the Remotion breath composition (via cycleProgress).
 */
export function breathAt(elapsedMs: number, pattern: BreathPattern, sessionSeconds: number): BreathState {
  const cycle = cycleSeconds(pattern);
  const elapsed = Math.max(0, elapsedMs / 1000);
  const done = elapsed >= sessionSeconds;
  const t = Math.min(elapsed, sessionSeconds);

  const within = t % cycle;
  let acc = 0;
  let phaseIndex = 0;
  for (let i = 0; i < pattern.phases.length; i++) {
    if (within < acc + pattern.phases[i].seconds || i === pattern.phases.length - 1) {
      phaseIndex = i;
      break;
    }
    acc += pattern.phases[i].seconds;
  }
  const phase = pattern.phases[phaseIndex];
  const intoPhase = within - acc;
  const phaseProgress = Math.min(1, Math.max(0, intoPhase / phase.seconds));
  const secondsLeft = done ? 0 : Math.max(1, Math.ceil(phase.seconds - intoPhase));

  // Scale eases with the breath: rises on inhale, holds high, falls on exhale, holds low.
  let scale = MIN_SCALE;
  if (phase.name === "breathe in") scale = MIN_SCALE + (MAX_SCALE - MIN_SCALE) * phaseProgress;
  else if (phase.name === "hold") scale = MAX_SCALE;
  else if (phase.name === "breathe out") scale = MAX_SCALE - (MAX_SCALE - MIN_SCALE) * phaseProgress;
  else scale = MIN_SCALE; // hold in

  return {
    phaseIndex,
    phaseName: phase.name,
    phaseProgress,
    secondsLeft,
    scale,
    sessionProgress: Math.min(1, t / sessionSeconds),
    cycleProgress: within / cycle,
    cycle: Math.floor(t / cycle),
    done,
  };
}
