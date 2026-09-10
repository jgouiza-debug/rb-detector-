# Peer review — by Systems Designer

## 1. Ranking (best evidentiary quality first)

- **C** — thorough, well-cited, and correctly *calibrated*: raises the thread-top-bar-missing question as an open item for peers rather than scoring against an unconfirmed guess (verified below — the calibration was right).
- **B** — strong, verifiable A1 catch (unlabeled bubble-buttons, cross-checked against `gate-report.json` interactiveCount 35/46); reasonable throughout.
- **D** — contains this round's single best catch (see #3) but overreaches by scoring an unconfirmed claim as fact (see #4).
- **A** — weakest. Zero red flags, and defends a claim the screenshot directly contradicts.

## 2. Disputes

1. **Review A, B5/general — void claim.** They said `settings-subscription-light`'s gap reads as "deliberate thumb-zone anchoring." I opened the screenshot: a 90px "current plan/free" card ends ~y215, then unbroken cream to the CTA at y≈735 — no content, no image, nothing authored. B, C, D and I all independently measured this the same way (~490–520px). **Void** on A's reading.
2. **Review A, all criteria — missing genericness catch.** A never mentions the `"Later, "` templated payoff copy (`scripted.ts:86`) that B, C, D and I all cite by line number as making every timeline screenshot read as mail-merge. For a persona built to hunt genericness, a complete miss here undercuts the near-perfect scorecard.
3. **Review D, A1 — WeekFlow color collision.** Verified in `lib/theme/tokens.ts:44` (`heavy: { bg: palette.line }`) against `WeekFlow.tsx:29` (`no-entry` fallback is also `var(--line-c)`) and confirmed visually in `timeline-light.jpg`: dots 1 and 7 render as near-identical pale cream circles, distinguished only by a 15px glyph. Nobody else (A, B, C, or me) caught this. **Uphold** — this is D's strongest finding this round.
4. **Reviews D/C, A5/C4 — thread top bar "missing".** D docks A5 (5/6) and C4 (4/5) treating the absent `ThreadTopBar` as a probable bug; C raises the same observation but declines to score it, asking peers to confirm. I checked `thread-light.jpg`: the frame shows date dividers "Sat, Sep 5" → "Mon, Sep 7" with the composer pinned at bottom — the signature of a chat auto-scrolled to its newest message, not a failed `sticky`. **C's calibration was correct; D's docked score was premature.**
5. **Review B, A1 — bubble buttons.** Verified in `Bubble.tsx:21`: every message, user and Pip alike, is a `<button>` with no `aria-label`, accessible name = raw text. Real and gate-corroborated (interactiveCount 35/46).

## 3. Own score changes

Combining #3, #5, and my own already-noted `animate-pulse` miss, A1 has three independent, verified misses beyond the gate. Revising down from my original 11.

```json
{"revisedScores": {"A1": 9}}
```
