import type { BreathState } from "./engine";

/**
 * The three hand-drawn Pip frames cut from the meditation reference sheet
 * (eyes open → half-lidded → closed). Paths are relative to `public/` so the
 * same list feeds Remotion's `staticFile()` and Next's static serving.
 */
export const PIP_FRAMES = [
  { key: "open", src: "pause/pip-open.png", label: "eyes open" },
  { key: "soft", src: "pause/pip-soft.png", label: "eyes soft" },
  { key: "closed", src: "pause/pip-closed.png", label: "eyes closed" },
] as const;

export type PipFrameKey = (typeof PIP_FRAMES)[number]["key"];
export type FrameWeights = Record<PipFrameKey, number>;

/** Pixel size of each frame's square canvas in `public/pause`. */
export const PIP_FRAME_SIZE = 394;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Smoothstep confined to the middle of a phase so a crossfade reads as one
 * unhurried blink rather than a ghosted double-image for the whole phase.
 */
export function gate(p: number, from = 0.3, to = 0.7): number {
  const x = clamp01((p - from) / (to - from));
  return x * x * (3 - 2 * x);
}

/** Eased fullness of the breath 0 (empty) .. 1 (full), for scale and glow. */
export function fullnessAt(state: BreathState): number {
  const p = clamp01(state.phaseProgress);
  const s = 0.5 - 0.5 * Math.cos(Math.PI * p); // ease-in-out sine
  switch (state.phaseName) {
    case "breathe in":
      return s;
    case "hold":
      return 1;
    case "breathe out":
      return 1 - s;
    default:
      return 0;
  }
}

/**
 * Eyelid position across a breath: 0 = open, 1 = half-lidded, 2 = closed.
 * The inhale opens the eyes as the body fills, the hold settles them to
 * half-lidded, the exhale closes them, and the empty hold keeps them closed.
 * Every phase boundary is continuous, for both patterns.
 */
export function eyelidAt(state: BreathState): number {
  const p = clamp01(state.phaseProgress);
  switch (state.phaseName) {
    case "breathe in":
      return 2 - 2 * gate(p, 0.15, 0.85);
    case "hold":
      return gate(p);
    case "breathe out":
      return 1 + gate(p);
    default:
      return 2;
  }
}

/** Per-frame blend weights (a partition of unity across adjacent frames). */
export function frameWeights(state: BreathState): FrameWeights {
  const lid = eyelidAt(state);
  return {
    open: clamp01(1 - lid),
    soft: clamp01(1 - Math.abs(lid - 1)),
    closed: clamp01(lid - 1),
  };
}

/**
 * Convert blend weights into stacked CSS opacities (bottom → top: open, soft,
 * closed) so the composite equals the weighted mix with no mid-fade dip.
 */
export function layerOpacities(w: FrameWeights): FrameWeights {
  const out: FrameWeights = { open: 0, soft: 0, closed: 0 };
  let acc = 0;
  for (const f of PIP_FRAMES) {
    acc += w[f.key];
    out[f.key] = acc > 0 ? w[f.key] / acc : 0;
  }
  return out;
}

/** The single frame that best represents the state (reduced-motion fallback). */
export function dominantFrame(state: BreathState): (typeof PIP_FRAMES)[number] {
  const w = frameWeights(state);
  return PIP_FRAMES.reduce((best, f) => (w[f.key] > w[best.key] ? f : best), PIP_FRAMES[0]);
}
