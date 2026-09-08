# Peer review — Taste Critic

## 1. Ranking (best evidence first)

1. **Review B** — the only reviewer to find something the gate structurally cannot catch: `TimelineView.tsx:116-131` gives the mood filter `role="tablist"`/`role="tab"` with no `aria-controls`/arrow-keys, and `BreathingPacer.tsx:64-65` wraps a mutating `<h1>` in `aria-live="polite"`, firing 15-30 times on the one screen meant to calm you. Both verified in source, both real WCAG issues axe can't see, neither caught by A/C/D.
2. **Review C** — harshest scorer but for cause: verified on `memory-card-light-full` that the reflection body ("Big review at work today, I was so nervous going in.") is repeated verbatim (lowercase, unedited) two screens down under "WHAT I SAID, THAT DAY." That's the single strongest B5/C3 finding across all five reviews — the keepsake literally hands the user their own words back and calls it a memory.
3. **Review D** — verified `VoiceSheet.tsx` waveform: 7 `animate-voicebar` bars on a fixed CSS loop while `useDictation.ts` does zero audio-level analysis. A real, specific "motion because it's possible" catch, `aria-hidden` so not an A1 issue, correctly scoped to B4/B5.
4. **Review A** — good radius-namespace and moodTokens catches, but two of its four "beyond the gate" claims overreach: see disputes below.

## 2. Disputes

1. **Review A, A1**: claims sighted (40%) vs screen-reader (25%) progress "disagree on all four steps." `StepShell.tsx:16` also sets `aria-valuetext="step {step} of {total}"`, which SRs announce in preference to computing valuenow/valuemax — so users actually hear "step 1 of 4," not 25%. I'd score this a minor code-hygiene note, not a user-facing mismatch on 4 screens.
2. **Review A, red flag**: claims `heavyTint` (#D6CCBC) is "brighter than the bright chip" on `timeline-dark`. I computed luminance: heavyTint 0.804 vs sunlight 0.870 — heavy is *darker*, not brighter. Only the `mixed` claim (pipBubble 0.953) holds. Flag stands, half the evidence doesn't.
3. **My own review vs C's**: my notes cited "Sep 7 and Sep 1 (locked)" repeating "I want to remember this one." Re-running `synthesizeDay` over all 10 seed days confirms the repeat is real (2026-08-31/09-01), but the paywall screenshot's actual locked example is "Sunday, August 30, 2026" (calm, no repeat) — I mislabeled which day demonstrates it; can't point to it in a rendered screen.
4. **Uncontested but under-scored by me**: A/B/C/D all flag `BreathingPacer.tsx:65` setting Fraunces on the pause screen (brand §7 reserves it for memory surfaces). My own review didn't catch this at all.

## 3. Changes to my own scores

- **A1 12→10**: B's tablist-role and aria-live findings are verified in source and are exactly what A1 is meant to catch ("screen-reader labels on controls") — the gate's axe pass doesn't cover role/behavior mismatches.
- **A4 6→5**: confirmed `font-reading` on `BreathingPacer.tsx:65`, unflagged in my round; four other reviewers caught it against brand-guidelines §7.
- **C3 5→4**: confirmed via `memory-card-light-full.jpg` that the keepsake body repeats the raw entry verbatim under "WHAT I SAID, THAT DAY" — a real delight failure I missed, distinct from the paywall-blur flag I did catch.

```json
{"revisedScores": {"A1": 10, "A4": 5, "C3": 4}}
```
