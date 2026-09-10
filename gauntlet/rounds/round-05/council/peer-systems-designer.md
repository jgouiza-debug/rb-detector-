# Peer review — by Systems Designer

## 1. Ranking by evidentiary quality

1. **D** (81, 4 flags) — best evidence density. Read `scripted.ts` line-by-line and found two real bugs no one else caught: the echo filter (`bodyWords` needs ≥4 letters but `echoes()` only extracts ≥5-letter words from the candidate, so "take" never registers) and the progress bar (`pct=(step+1)/(total+1)`, verified `step={1}` at name/page.tsx → 40% on step 1 of 4). Both confirmed against source.
2. **C** (unstated total, 0 flags) — smallest scorecard but the two catches are gate-invisible and verified real: `Bubble.tsx` wraps every message in a `<button>`, and the skip-link (`app/layout.tsx:66 href="#main"`) targets `app/(app)/layout.tsx:20`'s `<div id="main">`, which wraps the header it's meant to skip. Confirmed by reading both files.
3. **A** (81, 1 flag) — good specifics (unlabelled BookHeart nav, `MOOD_FILTERS` missing "mixed", WeekFlow reading raw ISO dates) but doesn't go as deep into the synthesis code as D.
4. **B** (95, 0 flags) — most eloquent, least skeptical. A2=8/8 and A3=8/8 both rest on `.tap`/`pb-safe` existing in the markup without checking whether `--pb-safe-min` resolves to anything (it doesn't — verified, see below). The highest total in the set is partly a product of not looking for what isn't there.

## 2. Disputes

**Review B, A2/A3 (8/8 each):** B cites `pb-safe` on the composer/CTAs as proof of safe clearance. Verified in `app/globals.css:243-244`: `.pt-safe`/`.pb-safe` resolve via `var(--pt-safe-min, 0px)` — and `--pt-safe-min`/`--pb-safe-min` are grepped nowhere in the codebase. On a non-notched viewport `env(safe-area-inset-*)` is 0, so both resolve to 0px. Gate's own A3.void column shows exactly **0px** void on `onboarding-welcome`, `onboarding-name`, `settings`, `settings-subscription`, `memory-locked-paywall` — the CTA sits flush to the viewport edge on all five, corroborating the code read. I'd score A2=7/8, A3=6/8, as I did.

**Review D, C3 claim re-scored by me:** D's title-drop finding (MemoryCard/MemoryDetail never render `day.title`; `full` = today+yesterday via MemoryCard, `older` via CompactCard which does render it) checks out exactly in `TimelineView.tsx:79-80` and `MemoryCard.tsx`/`MemoryDetail.tsx`. This is a real defect in the reveal itself — I missed it in my own review and am revising C3 down for it (see below).

## 3. Changes to my own scores

- **A1: 12 → 10.** Verified C's two catches are real: `Bubble.tsx` renders every scrollback message as a `<button type="button">` for a timestamp toggle, and the skip-link's `#main` target contains the header. Gate's axe/tab-order probes don't catch either; I didn't check for them myself.
- **C3: 6 → 5.** D's title-drop is confirmed in source (`TimelineView.tsx:79-80`) — today's and yesterday's keepsake silently discard the user's own last line for a stock closer, which is a real defect in "the memory reveal earns its place," not a decoration issue I'd already covered.

```json
{"revisedScores": {"A1": 10, "C3": 5}}
```
