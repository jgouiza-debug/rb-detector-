export type PhaseName = "breathe in" | "hold" | "breathe out" | "hold in";

export interface BreathPhase {
  name: PhaseName;
  seconds: number;
}

export interface BreathPattern {
  key: "box" | "four78";
  label: string;
  note: string;
  phases: BreathPhase[];
}

/** Box breathing: 4-4-4-4. The calm, balanced default. */
export const BOX: BreathPattern = {
  key: "box",
  label: "4-4-4-4 Box",
  note: "balanced nervous grounding",
  phases: [
    { name: "breathe in", seconds: 4 },
    { name: "hold", seconds: 4 },
    { name: "breathe out", seconds: 4 },
    { name: "hold in", seconds: 4 },
  ],
};

/** 4-7-8: a longer exhale for winding down. */
export const FOUR78: BreathPattern = {
  key: "four78",
  label: "4-7-8 Calm",
  note: "deeper wind-down",
  phases: [
    { name: "breathe in", seconds: 4 },
    { name: "hold", seconds: 7 },
    { name: "breathe out", seconds: 8 },
  ],
};

export const PATTERNS = { box: BOX, four78: FOUR78 } as const;

export function cycleSeconds(p: BreathPattern): number {
  return p.phases.reduce((n, ph) => n + ph.seconds, 0);
}
