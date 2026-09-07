/**
 * Brand palette from docs/handoff/02-brand-guidelines.md, plus the derived
 * "ink" variants of the mood accents so mood text never fails WCAG AA.
 * app/globals.css mirrors these values; the contrast test keeps them honest.
 */
export const palette = {
  sunlight: "#FFDE7A",
  honey: "#F5B841",
  amberInk: "#B9791A",
  amberDeep: "#82540F",
  cream: "#FFF9ED",
  ink: "#2B2620",
  inkSoft: "#6B635A",
  pipBubble: "#FFF3D1",
  userBubble: "#FFCF4D",
  line: "#EFE6D3",
  // Heavy needs its own surface: the no-entry dot uses `line`, and a day you
  // survived must never look like a day you skipped.
  heavyTint: "#D6CCBC",
  sky: "#8FC7D9",
  blush: "#F3B7A6",
  sage: "#A9C6A1",
  night: "#1C1A17",
  nightRaised: "#26231F",
  nightText: "#F3ECDD",
  nightSoft: "#C3B9A9",
  nightBubblePip: "#33302A",
  nightLine: "#3A352E",
  surface: "#FFFFFF",
  skyInk: "#2F6D80",
  blushInk: "#9C4F3A",
  sageInk: "#4F6B47",
} as const;

export type MoodTag = "bright" | "calm" | "heavy" | "tender" | "growing" | "mixed";

/**
 * Mood → surface colour (dots, pills) and the text colour that passes AA on cream.
 * The mood's *colour* is the primary signal; a coherent line icon (see
 * lib/theme/moodIcons.ts) is the secondary cue — no emoji.
 */
export const moodTokens: Record<MoodTag, { bg: string; fg: string; ink: string; label: string }> = {
  // fg = text ON the pill (always ink, which passes on every pastel). ink = the mood's
  // accent colour for text ON cream (each passes AA >= 4.5 on cream).
  bright: { bg: palette.sunlight, fg: palette.ink, ink: palette.amberDeep, label: "Bright" },
  calm: { bg: palette.sky, fg: palette.ink, ink: palette.skyInk, label: "Calm" },
  heavy: { bg: palette.heavyTint, fg: palette.ink, ink: palette.inkSoft, label: "Heavy" },
  tender: { bg: palette.blush, fg: palette.ink, ink: palette.blushInk, label: "Tender" },
  growing: { bg: palette.sage, fg: palette.ink, ink: palette.sageInk, label: "Growing" },
  mixed: { bg: palette.pipBubble, fg: palette.ink, ink: palette.amberDeep, label: "Mixed" },
};

export type ContrastRole = "body" | "large" | "nontext";

/**
 * Every (foreground, background) pair the UI is allowed to use, with the role
 * that decides the WCAG threshold: body 4.5:1, large (>= 18.66px bold or 24px) 3:1,
 * nontext (focus rings, ring tracks, icons) 3:1.
 */
export const allowedPairs: { name: string; fg: string; bg: string; role: ContrastRole }[] = [
  { name: "ink on cream", fg: palette.ink, bg: palette.cream, role: "body" },
  { name: "ink on surface", fg: palette.ink, bg: palette.surface, role: "body" },
  { name: "ink on user-bubble", fg: palette.ink, bg: palette.userBubble, role: "body" },
  { name: "ink on pip-bubble", fg: palette.ink, bg: palette.pipBubble, role: "body" },
  { name: "ink on honey (CTA)", fg: palette.ink, bg: palette.honey, role: "body" },
  { name: "ink on sunlight", fg: palette.ink, bg: palette.sunlight, role: "body" },
  { name: "ink-soft on cream", fg: palette.inkSoft, bg: palette.cream, role: "body" },
  { name: "ink-soft on surface", fg: palette.inkSoft, bg: palette.surface, role: "body" },
  { name: "ink-soft on pip-bubble", fg: palette.inkSoft, bg: palette.pipBubble, role: "body" },
  { name: "ink on heavy pill", fg: palette.ink, bg: palette.heavyTint, role: "body" },
  { name: "cream on ink (strong CTA)", fg: palette.cream, bg: palette.ink, role: "body" },
  { name: "night-text on night", fg: palette.nightText, bg: palette.night, role: "body" },
  { name: "night-text on night-raised", fg: palette.nightText, bg: palette.nightRaised, role: "body" },
  { name: "night-text on night pip bubble", fg: palette.nightText, bg: palette.nightBubblePip, role: "body" },
  { name: "night-soft on night", fg: palette.nightSoft, bg: palette.night, role: "body" },
  { name: "night-soft on night-raised", fg: palette.nightSoft, bg: palette.nightRaised, role: "body" },
  // Mood accent text on cream (memory detail).
  { name: "amber-deep on cream", fg: palette.amberDeep, bg: palette.cream, role: "body" },
  { name: "amber-deep on pip-bubble", fg: palette.amberDeep, bg: palette.pipBubble, role: "body" },
  { name: "amber-deep on sunlight", fg: palette.amberDeep, bg: palette.sunlight, role: "body" },
  { name: "sky-ink on cream", fg: palette.skyInk, bg: palette.cream, role: "body" },
  { name: "blush-ink on cream", fg: palette.blushInk, bg: palette.cream, role: "body" },
  { name: "sage-ink on cream", fg: palette.sageInk, bg: palette.cream, role: "body" },
  // amber-ink is an ACCENT: large text / icons / focus rings only, never body text.
  { name: "amber-ink on cream (large/accent)", fg: palette.amberInk, bg: palette.cream, role: "large" },
  { name: "amber-ink on pip-bubble (large/accent)", fg: palette.amberInk, bg: palette.pipBubble, role: "large" },
  { name: "focus ring amber-ink on cream", fg: palette.amberInk, bg: palette.cream, role: "nontext" },
  { name: "focus ring amber-ink on surface", fg: palette.amberInk, bg: palette.surface, role: "nontext" },
  { name: "focus ring sunlight on night", fg: palette.sunlight, bg: palette.night, role: "nontext" },
];

/** Pairs that look tempting and must never be used for text. The test asserts they fail body. */
export const forbiddenTextPairs: { name: string; fg: string; bg: string }[] = [
  { name: "ink-soft on user-bubble", fg: palette.inkSoft, bg: palette.userBubble },
  { name: "amber-ink on cream", fg: palette.amberInk, bg: palette.cream },
  { name: "sunlight on cream", fg: palette.sunlight, bg: palette.cream },
  { name: "honey on cream", fg: palette.honey, bg: palette.cream },
  { name: "sage on cream", fg: palette.sage, bg: palette.cream },
  { name: "sky on cream", fg: palette.sky, bg: palette.cream },
  { name: "blush on cream", fg: palette.blush, bg: palette.cream },
];
