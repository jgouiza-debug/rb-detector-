# Taste Critic — peer review of A–D

## 1. Ranking by evidentiary quality
1. **D** — richest verifiable code trail; I independently confirmed the headline claim (`app/globals.css` has zero `@layer` blocks, so `.tap/.pt-safe/.pb-safe/.px-safe/.font-reading` are unlayered and beat every Tailwind utility on the same element regardless of source order). Loses a notch for missing the keepsake copy duplication entirely.
2. **C** — disciplined, checklist-run, and its sharpest claim checks out verbatim: `Composer.tsx:80` is `size-5` (20×20px) on `removePhoto`, confirmed by grep. But scored B5/C3 high without ever reading the reflection copy closely.
3. **B** — independently found the same keepsake-copy defect I did (duplicate closing, casing seam) and cited the exact same screenshot and source table; strongest C2/C3 reasoning of the four, though some B4 language ("nobody will feel the difference") is taste opinion dressed as fact.
4. **A** — clean, specific, well cross-checked against the gate, but the least critical of the round's biggest content bug — scored B5 and C3 the highest of anyone (7/8, 5/6) while citing the very screenshot that contradicts it.

## 2. Disputes
**Review A, C3 (5/6):** claims the keepsake reveal is "genuinely singular." `timeline-light-full.jpg` shows Mon Sep 7 and Sun Sep 6 both closing "Some of it good, some of it not, all of it mine." — traced to the 3-line `CLOSINGS.mixed` table in `scripted.ts:83`, hash-picked. The rubric's own example of C3 is "the memory reveal" — this is that moment, and it repeats. I'd score no higher than 3.

**Review C, B5 (7/8):** never mentions the copy seam despite close reading elsewhere. `thread-light.jpg`/`timeline-light-full.jpg` show "Today was a lot honestly. work was heavy... I got through it" — capital, lowercase-after-period, capital, inside one keepsake (`sentence()` only capitalises index 0, `scripted.ts:69-73`). I'd dock 2 more.

**Review D, red flags (2 listed... actually 3):** despite grep-counting across `app/` and `components/`, none of D's three flags is the copy duplication B and I both traced to the same `CLOSINGS` table and the same screenshot D otherwise mines for pixel measurements. A methodology built on exhaustive greps should have caught it — worth naming as a gap, not a wrong claim.

**Review D's unlayered-CSS claim (A3/B4) — verified, not overreach:** I checked `app/globals.css` directly: `@import "tailwindcss"` at line 1, then zero `@layer` wrappers anywhere in the file. D's cascade-priority argument holds exactly as stated.

**Review D, A2 "sign-out clipped at y=843":** plausible given the confirmed CSS bug, but the rendered `settings-light.jpg` reads as essentially intact by eye — a sub-pixel claim I can't confirm visually from a compressed still. Treat as likely-true-but-unverified-by-screenshot, not void.

## 3. Changes to my own scores
**A3: 6→** (was 7). D's unlayered-`.pt-safe/.pb-safe/.tap` finding is real and independently confirmed (no `@layer` in `globals.css`) and produces exactly the kind of inconsistent-margin symptom A3 measures (onboarding progress bar flush to y≈0, welcome sign-in link ~11px from the edge) that the 8pt sampler can't see because the zeroed values still land on-grid. I missed this in my own pass; it's a legitimate additional dock.

No change to B5 or C3 — rereading `scripted.ts` and `timeline-light-full.jpg` alongside the peer set confirms the keepsake copy is still templated (duplicate closing across two cards, a mid-sentence casing bug on today's own hero card), which is exactly what my original 5 and 3 already priced in.

```json
{"revisedScores": {"A3": 6}}
```
