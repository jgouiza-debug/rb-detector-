# Peer review by Taste Critic

## 1. Ranking by evidentiary quality
1. **B** — best: cites file:line for every claim, quantifies usage counts (21× `rounded-2xl` vs 17× `rounded-card`, 70× the 12px step), and is the only review alongside A to catch the off-brand `BreathingPacer` gradient with the exact source line.
2. **A** — equally thorough and self-consistent; ties B on catching the gradient, gives the most granular B5/C2/C3 prose evidence (verbatim quotes, file:line), scores track the gate numbers exactly.
3. **D** — solid, comprehensive, correct on the gate cross-checks, but misses the off-brand gradient entirely ("none found") and leans on A/B/C's own findings more than fresh evidence in places.
4. **C** — same raw numbers as everyone, but has an internal contradiction (see dispute 1), misses the gradient (see dispute 2), and its B5 score doesn't follow from its own C2/C3 evidence (dispute 3).

## 2. Disputes
1. **Review C, B3**: claims `.animate-bubble-in`/`.animate-fade-up` are "timed at 320-380ms — inside the 150-300ms range brief calls for, if slightly over." 320-380ms is not inside 150-300ms; it's fully outside it. Score should reflect the overshoot plainly, as A/B/D do, not hedge it as "inside... if slightly over."
2. **Reviews C & D, red flags ("gradients: none found")**: both checked onboarding/splash/meditation and missed `BreathingPacer.tsx`'s `bg-gradient-to-b from-surface to-bg` full-page wash on meditation-pause, caught correctly by A and B with the source line. Brand guidelines §6 permits only sunlight→honey "behind Pip or on the splash/icon" — a surface→bg page wash isn't that gradient, and it's the direct cause of meditation-pause/dark's 39.2% dominant-colour fail in the gate. I'm revising my own red-flag tally to count this as a confirmed hit rather than "borderline."
3. **Review C, B5 (6/8)**: scores on lowercase copy and the allowed gradient without weighing the banned "Unlock with Pip+" (3 surfaces) or the identical closing sentence on all 7 timeline cards — evidence C's own C2/C3 rows cite in the same review ("feels mechanical," "templated"). B5 should track closer to A/B/D's 4-5, not sit 1-2 points above them on the same facts.
4. **My own round-00 claim** (B2/top-fix): I said the paywall `strong` Button is "unthemed in dark... #2B2620 slab on #26231F card, nearly invisible." `memory-locked-paywall-dark.jpg` shows the CTA as a clearly legible honey/amber pill with dark ink text — on-brand and visible. This claim was wrong; I retract it (see score change below).
5. No dispute on the raw gate numbers (67/210 sub-44 targets, 48.4% on-grid, 9 left edges, 10 type sizes) — all four reviews and mine match `gate-report.md` exactly.

## 3. Changes to my own scores
- **B2: 4 → 5.** One of my three negative pillars for B2 (unthemed dark CTA) is disproved by the screenshot; the remaining evidence (Title Case leaking onto payoff screens, two coexisting card radii) still stands but is thinner without it.

```json
{"revisedScores": {"B2": 5}}
```
