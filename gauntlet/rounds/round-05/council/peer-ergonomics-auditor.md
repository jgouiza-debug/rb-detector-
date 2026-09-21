# Peer review — Ergonomics & Accessibility Auditor

## 1. Ranking by evidentiary quality
1. **D** — best: measures pixels with `sharp`, cross-checks claims against *built* CSS byte offsets (`--pb-safe-min` undefined), and counts every spacing/icon/avatar class by grep rather than eyeballing.
2. **B** — precise file:line citations throughout, and honest about the line between "confirmed on screen" and "confirmed only in source" (B3) — rare epistemic hygiene.
3. **C** — sharp, code-verified bugs in `scripted.ts` (echo-filter threshold, pronoun capitalization) but several scores lean on taste ("too bouncy", "orphaned line") rather than measurement.
4. **A** — real findings (jargon `aria-label`, raw-ISO-date announcement) but mostly eyeballed y-coordinates, and its B/C-block scoring duplicates the Taste Critic's lane more than it adds new evidence.

## 2. Disputes
**Review B, A1 (12/12):** cites "a real `.skip-link`" as evidence but never traces its target. `app/layout.tsx:66` → `href="#main"` → `app/(app)/layout.tsx:20`'s `<div id="main">` → confirmed in `components/chat/Thread.tsx:25-31`, that div's first child is `<ThreadTopBar/>`, whose first focusable child is `<Link href="/timeline" aria-label="your story">` (`ThreadTopBar.tsx:19`). The skip link exists but skips nothing — the very header it's meant to bypass is the first stop after it. Not a 12.

**Review D, A1 (12/12) vs. own notes:** D's "Notes for peers" independently confirms `Bubble.tsx`'s every-message-`<button>` (verified: line 21, `title="tap for the time"`) — the same defect I scored down — yet docked nothing from A1 for it. I hold A1=9.

**Review C, red flags:** flags the locked-card `blur-[3px]` (`MemoryDetail.tsx`) as "the freemium-template move, not honesty." RUBRIC.md only flags blur "used because it's possible, not because it helps"; A, B, D, and I independently found this same blur functional (`aria-hidden`, real date still legible, signals locked). Not a rubric hit.

**Review D, A4 (5/6):** docks a point for 9 icon sizes / ~9 avatar sizes (I verified by grep: sizes 13/14/15/16/18/20/22/26/28 and 20/30/32/56/88/92/110/120/140 — real). But RUBRIC.md scopes A4 to type sizes/families/weights + palette only; icon/avatar consistency is B2 (systemization) territory. A4 should stay 6/6.

## 3. Changes to own scores
No changes. Both A1 defects re-verified against source this pass (exact lines above) and neither peer contradicted them — D corroborated the button issue without scoring it, no one checked the skip-link's target at all.

```json
{"revisedScores": {}}
```
