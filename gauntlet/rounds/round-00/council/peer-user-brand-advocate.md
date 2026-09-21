# Peer review — by User & Brand Advocate

## 1. Ranking by evidentiary quality

1. **Review A** — deepest source-level counts (21 `rounded-2xl` vs 17 `rounded-card`, `p-7` outlier, 4 distinct gutters) and honestly flags the settings-subscription gutter anomaly as *unresolved* rather than scoring off a guess.
2. **Review D** — equally line-cited (`threadStore.ts`, `dwellMs()`, `navigator.vibrate`, `--motion-scale`), catches the same red flags as A independently, and asks precise peer-verification questions instead of asserting.
3. **Review B** — solid hit/no-hit red-flag audit and the sharpest catch of the batch (unthemed `Button strong` invisible on `memory-locked-paywall-dark`), but leans more on the gate table restated than on original digging.
4. **Review D … / Review C (weakest)** — see disputes below; contains a counting error and inflates several non-slice scores without engaging the counter-evidence everyone else found.

## 2. Disputes

- **Review C, A3**: says "`thread/light` shows 9 distinct left edges (12,30,48,85,98,110,122,135)" — that's 8 numbers. The gate report gives thread/light exactly 8 edges; **9** is the max and belongs to `thread-crisis/light` (12,**27**,30,48,85,98,110,122,135). Miscounted/misattributed; A3 evidence should cite thread-crisis for the 9, not thread/light.
- **Review C, B5 (6/8, highest of all five reviews)**: cites only clean lowercase copy and the sanctioned gradient, with no mention of the one finding A, B, D and I all lead with — every card in `timeline-light-full.jpg` ends with the identical sentence "Looking back, it felt like a lot to hold, and I got through it." (7/7, `scripted.ts:60`). I verified this myself against the screenshot. A score above 5 can't stand next to that; I'd put it at 3–4 like the rest of us.
- **Review C, C2 (6/7, highest of all)**: same gap — doesn't address "i hear you, sam." appearing twice verbatim in one screenful, which I confirmed directly in `thread-light.jpg`. A,B,D all score C2 4–5 citing exactly this. C's 6 is uncorroborated against the pixels.
- **Review C, C3 (5/6, highest of all)**: again doesn't weigh the templated reveal against brand §9's "make it feel like a tiny gift" — the same repeated closing line undercuts the one moment this criterion is about.
- **Review A's note to peers on the settings-subscription gutter**: I checked it directly. `settings-light.jpg`'s heading/card left edge sits at ~x20; `settings-subscription-light.jpg`'s sits at ~x55. It is real, visible in both renders side by side, not a capture artifact — worth the Systems Designer's source check.

## 3. Changes to my own scores

A2: all four peers independently landed on 3/8 from the same gate evidence I used (67/210 undersized, same worst offenders) for my 2/8. No peer supplied evidence I lacked — just closer convergence than I gave credit for. Revising up to 3.

```json
{"revisedScores": {"A2": 3}}
```
