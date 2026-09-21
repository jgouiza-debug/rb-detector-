# Peer review — by Interaction Engineer

## 1. Ranking by evidentiary quality (best first)

- **Review B** — most surgical. Cites exact files/lines for two real, machine-blind-spot violations (`Composer.tsx` remove-photo button at `size-5`; every `Bubble.tsx` message is a focusable button with `aria-expanded` but no `aria-controls`), scopes docks tightly to what's proven, no overreach.
- **Review A** — deepest pixel work; the unlayered `.pt-safe/.pb-safe` cascade bug (nine screens, reproducible) is the single highest-leverage find across all five reviews. But it misapplies the A4 criterion to Pip's own SVG dimensions (not type sizes), and — despite claiming exhaustive target-checking — missed the same `Composer.tsx` `size-5` button Review B caught.
- **Review D** — independently corroborates Review C's `CLOSINGS` collision with different, verifiable citations (word-reuse instances, exact screen), cleanest explicit red-flag count. Some C4 scoring imports C3-territory copy complaints into a flow/friction criterion the rubric defines more narrowly.
- **Review C** — found the same `CLOSINGS` bug first in my reading order and ties it to the brand doc precisely, but leans more narrative ("Could this only be Pip?") and the C2 "cheering→Mixed" claim can't be confirmed from the visible screenshot (the raw entry text isn't shown, only the synthesized card).

## 2. Disputes

1. **A2**: I scored 8/8; Review B scored 5/8 citing `Composer.tsx` line 80 — the photo-thumbnail "remove" button is `size-5` (20×20px) against the `.tap` 44px floor used everywhere else in that file. Verified in source: real, reachable, not in `gauntlet/screens.ts`'s 21 states. I'd score **6/8** — a confirmed single-control miss, not systemic enough for 5/8.
2. **C3**: I scored 5/6; Reviews C and D scored 3/6 for the `CLOSINGS` table. Verified against `timeline-light-full.jpg`: Monday and Sunday (both "Mixed") end on the identical line "Some of it good, some of it not/no…". `lib/adapters/ai/scripted.ts` line ~88 picks by `seed % 3` across only 3 closings per mood — its own comment claims "almost never share a shape," which the screenshot disproves. Brand doc `02-brand-guidelines.md` line 192: "Don't fake-deep. No fortune-cookie wisdom." I'd score **3/6**.
3. **B2**: I scored 7/7 ("no second card shape... found anywhere I read"). Reviews A/C/D scored 5-6/7. Verified: `MemoryDetail.tsx` line 49 says "your story", line 84 says "keepsake edition" for the same `/timeline` href; `CrisisCard.tsx` and `app/help/page.tsx` render identical resource data as different components (2-line `rounded-2xl bg-surface-2` rows vs 3-line `rounded-card bg-surface` rows). I'd score **5/7**.
4. Review A docks A4 to 5/6 for Pip's mascot rendering at "9 sizes" (20-140px) with no token. That's SVG/illustration dimension, not a type size — A4 is scoped to text sizes/families/weights per the rubric. I'd keep A4 at 6/6.
5. My own A1=12/12 didn't check `Bubble.tsx`'s tab-order cost (34-45 focusable buttons per thread whose only job is a timestamp) or `MemoryDetail.tsx`'s `aria-label="mark as resonated"` jargon — both confirmed in source. Reviews B/D are right; I'd score **11/12**.

## 3. Changes to my own scores

Confirmed in source and screenshots, not just trusted from "the gate passes":
- A1 12→11 (Bubble.tsx tab-stop burden + missing aria-controls, confirmed)
- A2 8→6 (Composer.tsx size-5 remove-photo button, confirmed real sub-44px target)
- B2 7→5 (BackLink text inconsistency + duplicated crisis/help resource list, confirmed)
- B5 7→5 (CLOSINGS collision is templated, not product-specific, copy — confirmed)
- C3 5→3 (same CLOSINGS collision undermines the one "purpose" moment, confirmed)

New red flag: **Generic/formulaic copy** — `lib/adapters/ai/scripted.ts` CLOSINGS table produces near-duplicate reflections (`timeline-light-full.jpg`, Mon Sep 7 / Sun Sep 6), contradicting its own code comment and brand doc §"no fortune-cookie wisdom."

```json
{"revisedScores": {"A1": 11, "A2": 6, "B2": 5, "B5": 5, "C3": 3}}
```
