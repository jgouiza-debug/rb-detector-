# Peer review — by Ergonomics & Accessibility Auditor

## 1. Ranking (best evidentiary quality first)

1. **Review C** — Exhaustive, line-item citation of gate-report numbers (spacing census, per-role sizes, colour shares all match verbatim) and honest about ambiguity (flags the settings-subscription gutter oddity as possibly a capture artifact instead of asserting it as fact). Weakest point: cites the exact same moderate axe evidence as A/B/D for A1 but scores it 12/12 with no deduction — internally inconsistent.
2. **Review A** — Tight, specific, per-file/line citations; appropriately flags the duplicate "i hear you, sam." as unconfirmed rather than overclaiming a bug. Loses ground on B4 (see dispute below).
3. **Review D** — Good specificity and an explicit red-flag tally, but contains one clear factual miss (see dispute below) that undercuts an otherwise careful review.
4. **Review B** — Real evidence underneath (line numbers, hex values, gate cross-refs) but wrapped in the most narrative/rhetorical prose of the four ("I would screenshot and send to a friend," "I would not pay $4.99") — exactly the eloquence-risk this step is meant to catch, even though the underlying citations mostly check out.

## 2. Disputes

- **Review D, B2/C4-adjacent claim**: they said the dark paywall CTA is "a #2B2620 slab on a #26231F card, nearly invisible." I viewed `memory-locked-paywall-dark.jpg` directly: the "Unlock with Pip+ ($4.99/mo)" button renders as a clearly distinct warm caramel/brown fill with bold cream text, plainly legible against the near-black card — not invisible. The gate's A1.contrast check also shows 0 contrast failures (axe + measured) on every screen including this one. I would not credit this as evidence for any B2 deduction.
- **Review A, B4**: they scored 5/5 flat, calling motion "the most disciplined area," with no deduction. But `meditation-pause-light.jpg` (which A reviewed) plainly shows a running "0:01 / 1:30" clock plus a countdown numeral "3" next to the breathing ring — a ticking timer on the app's one explicitly calm-down screen, which cuts against B4's own "motion lowers the heart rate" bar (B and D both docked for this). I'd score B4 at 4/5 for A's review, not 5/5.
- **Review C, A1**: cites the identical landmark/heading axe evidence as A, B, D, yet is the only one to award a full 12/12 with zero deduction, while the other three independently converged on 11/12 for the same facts. Real, if moderate, accessibility debt shouldn't score as flawless.

## 3. Changes to my own scores

Peer convergence (A=11, B=11, C=12, D=11) against my A1=9 shows I over-weighted moderate-only axe debt on a gate that PASSED cleanly (0 serious+critical, 76/76 focus, 0 reduced-motion leaks). Splitting toward consensus:

```json
{"revisedScores": {"A1": 11}}
```
