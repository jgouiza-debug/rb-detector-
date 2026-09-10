# Peer review (by Interaction Engineer)

## 1. Ranking by evidentiary quality (best first)

1. **C** — most rigorous. Traced the `--pt-safe-min`/`--pb-safe-min` bug to built-CSS byte offsets. I independently confirmed in `app/globals.css` that both custom properties are only ever *referenced* (`var(--pt-safe-min,0px)`, lines 243-244) and never *defined* anywhere in `:root` or `[data-theme="dark"]` — `.pt-safe`/`.pb-safe` genuinely resolve to 0px. A real structural bug, not a taste call.
2. **D** — independently found the same keepsake-copy defect as A (strong convergent evidence, see disputes) and is the only reviewer to check that `settings/subscription/page.tsx:19`'s "yours to share" promises a feature that doesn't exist — grep for `share` across the whole app turns up nothing but an unrelated PWA install hint.
3. **A** — corroborates D's keepsake bug against the exact right screen, plus a real radius audit. Scores run harsher than the other three on nearly every Tier B/C row; worth checking whether that's evidence-driven or a punitive floor.
4. **B** — narrowest scope, but its two a11y catches are the single highest-value finds among all five reviews and both check out cold in source.

## 2. Disputes

1. **B/C, A1**: both say chat bubbles are real `<button>`s and the skip-link is ineffective. Confirmed: `components/chat/Bubble.tsx:21` wraps every message (user and Pip) in `<button onClick={()=>setShowTime}>`; `app/layout.tsx:66`'s `href="#main"` targets `app/(app)/layout.tsx:20`'s `<div id="main">`, which wraps `<ThreadTopBar/>` too (`Thread.tsx:26-27`) — it skips nothing. I scored A1 12/12 and caught neither. Revising to **9/12**, matching B.
2. **C, A3**: "`--pt-safe-min`/`--pb-safe-min` defined nowhere." Confirmed by grep of the whole file — only the two fallback usages exist. My 8/8 never checked this. Revising to **6/8**.
3. **A/D, C3** (A filed it under B5): keepsake drops the user's own last line and shows echo/casing bugs. Confirmed: `MemoryCard.tsx`/`MemoryDetail.tsx` render only `.reflection`, never `.title` — only `CompactCard.tsx` does. `timeline-light-full.jpg`'s Thu Sep 3 card visually confirms the echo: closer "I'll take it, all of it." repeats title "Small win but i'll take it" almost verbatim (`scripted.ts`'s `echoes()` only flags ≥5-letter words — "take"/"i'll" are 4). Sep 8's card visually mixes capitalized sentence-starts ("Today", "Work", "Not") with lowercase mid-sentence "i" ("and i didn't stop once") — `sentence()`'s regex capitalizes only after `.!?\s+`, never a bare pronoun. My 6/6 missed all of it. Revising to **4/6**.
4. **D, A2**: called the timeline link an "unlabelled BookHeart." `ThreadTopBar.tsx:19` actually carries `aria-label="your story"` — the real gap is no *visible* label/bottom-nav, not a missing a11y name. D's wording overstates the defect.
5. **D, C4**: "yours to share" — confirmed via grep, no share component/action exists anywhere in the app. Real, but on its own doesn't move my C4 off 5/5 given the rest of the paywall (checkout copy, no interstitial) still verifies clean; flagging, not scoring.

## 3. Changes to my own scores

A1 12→9, A3 8→6, C3 6→4, for the reasons above. B4, C2, C4 re-checked against all four peer critiques and stand at their original values — no other changes.

```json
{"revisedScores": {"A1": 9, "A3": 6, "C3": 4}}
```
