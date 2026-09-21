# Peer review — by Systems Designer

## 1. Ranking by evidentiary quality (best first)

- **Review C** — deepest causal analysis: traces Monday's "Mixed" mood tag to a specific regex gap (`moodFrom` in `scripted.ts` has no "cheer/win" pattern), which I verified is exactly right. Harshest, most internally consistent scores; one overstated claim (MemoryCard animation, see disputes).
- **Review A** — independently caught the same generic-copy bug from a different angle (duplicate closing sentence, verbatim quote from the screenshot), plus a clean A2 ergonomics catch (icon nav vs spec's bottom-nav). Consistent method, scores track evidence.
- **Review D** — the most novel, precisely-verified single finding in the set (a real sub-44px control the gate structurally cannot see) plus solid aria-live/aria-hidden accessibility citations. Scores are calibrated to what was actually found, not padded.
- **Review B** — good code citations (rAF cleanup, `--motion-scale` wiring) but missed both of the round's highest-value, cross-confirmed bugs (duplicate closing text, mislabeled mood, tiny remove-photo button) entirely, and is the most generous of the four (93 total, zero red flags). Solid but least adversarial.

## 2. Disputes

**Review D, A2 (5/8 vs. gate PASS) — settled, real.** `components/chat/Composer.tsx:80` renders the photo "remove" button as `size-5` (20×20px) against the same file's own 44px `.tap` convention on every sibling control. `gauntlet/screens.ts` never attaches a photo before capturing any screen, so the gate structurally cannot see this state — its 0/200 count is accurate but incomplete, not wrong. Review D found a real target, not a machine error.

**Review C, C2 (they didn't score it but explain B5/C2's mood miss) — verified.** `lib/adapters/ai/scripted.ts:12` `moodFrom`'s "bright" regex is `(happy|great|proud|win|excited|good news|joy|celebrat)`; `app/api/dev/seed/route.ts:24` seeds Monday's second entry as "turns out the team was cheering for me the whole time" — "cheering" matches nothing, so a good-news day falls through to "mixed." Real, reproducible.

**Reviews A & C, B5/C3 duplicate-closing red flag — verified on-screen.** `timeline-light-full.jpg`: Monday Sep 7 and Sunday Sep 6 both end "...Some of it good, some of it not, all of it m[ine]" — I read this myself off the screenshot. `scripted.ts`'s `CLOSINGS.mixed` has only 3 entries picked by a text hash; with two Mixed days in one visible week, collision is a real, not fabricated, risk.

**Review C, B4 — half right.** Their Bubble.tsx claim holds: `animate-bubble-in` (`Bubble.tsx:27`) is unconditional, so all history bubbles pop on every thread open. Their MemoryCard claim is overstated: `TimelineView.tsx:149` passes `fresh={i===0 && d.date===today}` and `MemoryCard.tsx:16` correctly branches `animate-keepsake-in` vs `animate-fade-up` on that flag — this is intentional differentiation, not a flaw.

**Review B — no factual dispute, but a completeness gap.** Their B5/C2/C3 scores (7/6/5) and empty red-flag list don't reckon with the duplicate-closing or mood-miss findings above, which two other reviews independently surfaced and I've now confirmed in source. Worth weighting Review B's Tier B/C scores down relative to A/C/D on this basis.

## 3. Changes to my own scores

My review missed two things Reviews A/C/D caught and I've now verified:
- **A2 8→7**: missed the Composer.tsx `size-5` remove-photo button (see dispute above) — a real target my own grep-based sweep didn't catch because I never inspected the photo-attach state.
- **B5 6→5**: the verbatim duplicate closing across two Mixed-day keepsakes on one screen is a real "template smell" instance I didn't check for.
- **C2 6→5**: the mood-misclassification (a cheering day reads "Mixed") is a case of Pip missing the point of what was said — squarely a C2 miss I didn't test.
- **C3 5→4**: the reveal's own text repeating verbatim across two of the seven visible keepsakes undercuts "every nice moment earns its place" more than my original note (photo/date typography) captured.

```json
{"revisedScores": {"A2": 7, "B5": 5, "C2": 5, "C3": 4}}
```
