# Peer review — User & Brand Advocate

## 1. Ranking by evidentiary quality (best first)

1. **D** — every claim ties to a source line or a `gate-report.json` row (the 35/46 interactiveCount buttons, the 4px top-bar icon gap); deductions are narrow and match what's actually wrong. Total (90) reads earned.
2. **B** — most exhaustive cross-referencing (icon sizes, 7 radius values, `mt-auto` void mechanism, dark-mode Pip color); harsh but every point is sourced. A few scores run low relative to the evidence shown, but nothing is unsupported.
3. **C** — caught a real, verifiable A1 issue nobody else did (below) and named screens/words as instructed; slightly thinner sourcing than B/D on some lines.
4. **A** — highest total (93) with the thinnest evidence for it: it independently verifies gate numbers well but misses nearly every cross-cutting flaw B/C/D/I converged on. Weakest evidentiary quality despite the most confident prose.

## 2. Disputes

1. **Review A, B5 (7/8):** claims copy is specific throughout with no mention of the "Later," template. Confirmed in `lib/adapters/ai/scripted.ts` (`` `Later, ${e2.text...}` ``) — produces "Later, three days of fog…", "Later, felt genuinely peaceful…" across timeline-light-full. B, C, D and I all caught this; I'd cap B5 at 6/8, not 7.
2. **Review A, notes on settings-subscription/light:** reads the void as "deliberate thumb-zone anchoring." The screenshot shows ~500px of literally empty cream between the plan card (ends ~y215) and the CTA (~y735) with nothing between — RUBRIC.md's own red flag is "floaty spacing, no breathing room," not anchoring. B, C, D and I all flag this as a red flag.
3. **Review A, A1 (12/12):** no mention that `Bubble.tsx:21-37` wraps every message in a `<button>` whose only accessible name is the message text, with no label for what it does (toggle a hidden timestamp). Confirmed in source; `gate-report.md` shows 35 interactive elements on thread and 46 on thread-crisis, mostly these. B and D both dock A1 for it — I'm revising mine too (below).
4. **Review C, A1 — WeekFlow contrast:** verified at the token level. `moodTokens.heavy.bg = palette.line` (`#EFE6D3`) and the empty-day fallback in `WeekFlow.tsx:29` both resolve to the same `#EFE6D3` on cream `#FFF9ED` — a heavy day and an empty day render the same near-invisible dot color, told apart only by a 15px icon. Real, and missed by A, B, D. I'm revising my own A4 for it.

## 3. Changes to my own scores

- **A1: 12 → 11.** The Bubble-button screen-reader gap (dispute 3) is real and axe-invisible; I noted the "mark as resonated" label but didn't dock for the bigger pattern.
- **A4: 6 → 5.** The heavy/empty color collision in WeekFlow (dispute 4) is a genuine "muddy" color-system miss the gate can't see.

```json
{"revisedScores": {"A1": 11, "A4": 5}}
```
