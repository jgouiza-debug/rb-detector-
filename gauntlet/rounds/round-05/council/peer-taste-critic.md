# Peer review — Taste Critic

## 1. Ranking by evidentiary quality
1. **C** — best. Independently traced `--pt-safe-min`/`--pb-safe-min` as referenced-but-never-declared (`var(..., 0px)` fallback only) — I confirmed via grep: no `:root` declaration exists anywhere. Precise radius/label-offset counts, self-disclosed method ("what I claim as clean I checked myself").
2. **A** — strong, code-anchored (`WeekFlow` reading raw ISO dates aloud, `aria-label="mark as resonated"`, `MOOD_FILTERS` missing "mixed"), and matches my floaty-spacing measurement almost pixel-for-pixel independently.
3. **D** — careful about source-verified-vs-screenshot-verified claims (a real discipline), and the only one to catch the flat-orange photo placeholders. But misses the mood-casing fork and the safe-min bug entirely, and explains away every off-grid value as "deliberate" — too quick to clear the board for a 95/100.
4. **B** — weakest. Two genuinely excellent, unique a11y catches (bubbles as `<button>`, dead skip-link target), but the blanket "none found" sweep of the rubric's vibe-coded checklist doesn't hold up against the other three reviews or the screens.

## 2. Disputes
- **Review B, red flags** ("wrong balance... none found"): `onboarding-welcome-light.jpg` shows a plain empty cream gap between the subtext (ends ≈y345) and "hey pip" (starts ≈y728) — I measured it myself off the image, ~380-400px, matching A's 386px and C's 376px independently. I'd score this a live red flag, not "none found."
- **Review B, B2/red-flags** ("default framework spacing: none"): grep confirms `rounded-2xl`/`-3xl`/`-xl` (untouched Tailwind) on 15+ elements (SettingRow, AccountEditor, RhythmEditor, Composer field, Sheet, Skeleton, `MemoryDetail.tsx:124`) while `--radius-field` is used once. B never checked radius tokens at all; I'd move B2 to 5/7.
- **My own review, red flag #2** (paywall blur "freemium tease"): A, B, C and D all independently read the same blur as functional/considered (date legible on purpose, `aria-hidden`, "a door not a wall"). The rubric's own test is blur "because it's possible, not because it helps" — this helps. I concede the point; retracting.
- **Review D, A3** (8/8, "both off-grid tells traced to deliberate decisions"): true for the 12px offset, but D never checks the safe-area vars C found broken — a real gap D's otherwise careful review missed.
- **Reviews A/C/D vs B** on `moodLabel` casing ("bright" vs "Bright & warm", `scripted.ts`): caught by three of four peers independently; absent from B's review despite a near-perfect B2 score.

## 3. Changes to my own scores
- **A3: 7 → 6.** New evidence from Review C, verified myself (`grep -rn "pt-safe-min" app/globals.css` — declared nowhere, only consumed as a fallback), is a real, distinct spatial-system defect beyond the radius drift I already scored.
- Retracting red flag: `memory-locked-paywall` blur (see dispute above) — down to 3 flags.

```json
{"revisedScores": {"A3": 6}}
```
