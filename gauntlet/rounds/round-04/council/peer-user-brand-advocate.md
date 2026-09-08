# Peer review by User & Brand Advocate — round 04

## Ranking (best evidence first)

1. **D** — pixel-measured (y-coordinates, cascade-level bug on `.pt-safe`/`.tap` sitting outside any `@layer`, which I confirmed in `app/globals.css` — only `@import "tailwindcss"` at the top, no `@layer` anywhere, so those rules really do outrank Tailwind's own layered utilities). Most falsifiable claims per line.
2. **C** — shallower on B-tier mechanics than D, but is the only review besides mine to open the keepsake and find the actual defect: the duplicate closing and a mood-tagging bug, both confirmed below.
3. **B** — excellent method note and B3/B4 catches (heart toggle with no transition, `--motion-scale` not wired to `/pause`'s real animation), but C-tier scores are asserted from a "warm copy" impression without opening the same card C and I did.
4. **A** — accurate but thin; fewest independently-verified pixel/code claims.

## Disputes

1. **Review B, C3 (5/6) and Review A, C3 (5/6) and Review D, C3 (5/6):** none mention that Mon Sep 7 and Sun Sep 6 close on the same sentence. Confirmed on `timeline-light-full.jpg`: Sep 7 card ends "…Some of it good, some of it not, all of it mine." and Sep 6 ends "…Some of it good, some of it no…" (truncated, same line). `lib/adapters/ai/scripted.ts`'s own comment claims "two heavy days never end on the same sentence" — the screenshot contradicts the code's own claim. I'd score 2, not 5.
2. **Review D, C3 (5/6):** cites the photo-grid and date-orphan but misses a second, worse defect Review C caught: `memory-card-light-full.jpg` shows the actual last line was "turns out the team was cheering for me the whole time," yet the card is tagged **Mixed** with a downbeat closing. Verified in `scripted.ts`: `moodFrom`'s bright regex (`happy|great|proud|win|excited|good news|joy|celebrat`) has no match for "cheering," so a clearly good day silently falls through to `mixed`. That's a keepsake mistagging Pip's own listening — worse than the copy seam alone.
3. **Review B, C4 (5/5):** no mention of `settings-subscription-light.jpg`'s contradiction — "your last seven days, kept" (free plan) sits 60px above an unlabeled checklist starting "every day you've ever written, kept," with no "with pip+:" heading between them. I'd score 3, not 5.
4. **Review D's red flag "timeline-light-full — earlier section: repeated card grid as filler":** the six `CompactCard`s differ in date, title, body, and mood pill each — that's real, distinct content stacked in one shape, the same reasoning A, B, C and I all used to clear the *identical* settings rows. This flag reads as void against the rubric's own example ("identical section shapes… no distinguishing content").

## Changes to my own scores

C3: 3 → 2. The mood-mistagging bug (dispute #2) is a second, independently-confirmed defect on top of the duplicate closing, and it undercuts the exact promise ("Pip listens") the brand book stakes the product on. No change to C4 — the subscription-page contradiction and the corner-icon payoff hold up as scored.

```json
{"revisedScores": {"C3": 2}}
```
