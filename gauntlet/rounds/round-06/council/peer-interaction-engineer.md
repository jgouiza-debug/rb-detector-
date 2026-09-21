# Peer review — by Interaction Engineer

## 1. Ranking by evidentiary quality

1. **Review D** — Every claim I spot-checked resolved true (photo fixture, void spacing, timeline nav depth, "just paid?" button, keepsake repeating the user verbatim). Ties dispute to exact files/lines and to design-spec sections, not just the taste brief. Lowest score, but the score tracks the evidence, not the reverse.
2. **Review A** — Caught two real ARIA defects (below) with exact line numbers that I, C, and D all missed despite reading the same files. Concise, no padding, each score has a specific counter-check beyond "gate passed."
3. **Review B** — The `StepShell` aria-valuenow/visual-progress mismatch (A1) and the `moodTokens` dark-mode remap gap (A4/red flag) are both independently verifiable and neither appears in any other review — genuine new findings, not restated ones.
4. **Review C** — Real findings (blurred-ghost paywall, "kept" word count) but several scores read as impression ("could this only be Pip?") before evidence, and C1-C4 evidence is thinner than A/B/D's on the same criteria.

## 2. Disputes

**Review C, A1: 12/12.** They said "nothing missed." The screenshot/source shows two defects the gate cannot catch: `components/timeline/TimelineView.tsx:116-131` gives mood-filter chips `role="tablist"`/`role="tab"` with no `onKeyDown`, no `tabIndex` management, no `aria-controls` (verified — no keyboard handler exists in the file at all); `components/pause/BreathingPacer.tsx:64-65` wraps a `<h1>{state.phaseName}…</h1>` that changes every ~4s in `aria-live="polite"`, forcing 15-30 announcements over a 60-120s meditation. I would score 10/12, matching Review A's evidence.

**My own A1: 12/12 — void.** I wrote "nothing found that the gate missed" and verified only what the gate already reported. Same two defects apply to me. Revising to 10/12.

**My own A4: 6/6 — void.** I credited `globals.css` for making unlisted sizes impossible, but that only guards size count, not role. `BreathingPacer.tsx:65` sets `font-reading` (Fraunces) on the pause screen; both `docs/handoff/02-brand-guidelines.md:133` ("Memory cards + timeline reading view") and `gauntlet/taste-brief.md:33` ("Reading serif is reserved for the memory surfaces so the shift means something") restrict it to memory/timeline. Three of four peers (A, B, D) independently caught this; I didn't check role, only count. Revising to 5/6.

**My own C4: 5/5 — void.** Three of four peers (B, C, D) independently flag `components/settings/SubscriptionActions.tsx:48` — a permanently-visible "just paid? tap here" ghost button sitting under the primary CTA in the paid flow. I read this file and didn't register it as friction. Convergent, independent evidence beats my single read. Revising to 4/5.

**Review D, A2: 8/8 vs their own C4 dock.** D notes the timeline is reachable only via a top-right icon at y≈52 with no bottom nav (design-spec §2), correctly filing the dock under C4 rather than A2 (A2 is target size/thumb zone, not IA depth) — this is the right criterion placement and I'd have made the same call.

## 3. Changes to my own scores

- A1: 12 → 10 (two verified ARIA defects: mislabeled tablist with no keyboard pattern; aria-live spam on a mutating heading)
- A3: 8 → 7 (`PipAvatar size={30}` in `ThreadTopBar.tsx:13`/`TimelineTopBar.tsx:13` vs the system's `size={32}` in `Bubble.tsx:17` — off the half-grid, contradicting my "0 values off" claim; B's page-gutter point is weaker and not counted here)
- A4: 6 → 5 (Fraunces used outside the two brand-sanctioned surfaces, on the pause screen)
- C4: 5 → 4 ("just paid? tap here" is a permanent trust-undermining affordance in the paid flow, confirmed by three independent peers)

```json
{"revisedScores": {"A1": 10, "A3": 7, "A4": 5, "C4": 4}}
```
