# Peer review — by Ergonomics & Accessibility Auditor

## 1. Ranking by evidentiary quality

1. **Review A (79)** — deepest independent verification: confirmed icon-size drift (MemoryCard.tsx:22 `size={13}` vs WeekFlow.tsx:31 `size={15}`), confirmed `animate-pulse` missing from both reduced-motion blocks (globals.css:274-286), confirmed the `mt-auto` void mechanism. Harsh but earned.
2. **Review D (79)** — found the one real thing everyone else missed: WeekFlow's heavy-mood dot and empty-day dot share the same fill (verified: `moodTokens.heavy.bg = palette.line`, fallback `var(--line-c)` = `--line` = `#efe6d3`, same value in light mode). Docked for one overconfident claim (see dispute 3).
3. **Review B (87)** — careful hedging (flagged the thread-topbar absence as "probably a capture artifact, confirm" rather than asserting it), caught `aria-label="mark as resonated"` jargon. Undercut by giving A1 12/12 anyway.
4. **Review C (93)** — highest total, least independent digging. Missed the Bubble.tsx button issue, the `animate-pulse` miss, and the WeekFlow contrast collapse entirely; full marks on four of five Tier A rows track the gate almost verbatim rather than testing it.

## 2. Disputes

**A1, Reviews B/C:** both score 12/12. Verified against source: `Bubble.tsx:21` wraps every message in a `<button>` named only by the message text (35-46 per thread screen), and `Skeleton.tsx:4`'s `animate-pulse` is absent from both the `@media (prefers-reduced-motion)` block and `.motion-reduce-forced` (globals.css:274-286) — it keeps pulsing for users who asked for less. Neither is axe-visible. Full marks isn't supportable; I'd score ≤10.

**A3, Review C's note:** reads the ~500px settings-subscription gap as "deliberate thumb-zone anchoring." Screenshot confirms a "free" card ending ~y214 and the CTA starting ~y735 with nothing between — no content, no anchored composer, just `mt-auto`. That's a void, not a design choice; A/B/D's reading holds.

**A5, Review D:** claims thread-light "as rendered... has no visible route to the timeline or settings" because ThreadTopBar is absent from frame. The screenshot shows a bottom-scrolled thread (composer visible, top cut off) and the gate table marks thread's void column "scrolls" — this is a full-page capture artifact, matching Review B's more cautious read, not a broken landing state.

**A4, Review A's icon-scale claim:** verified — `MemoryCard.tsx:22` uses `size={13}`, `WeekFlow.tsx:31` uses `size={15}` for the same mood glyph set. Real, but it's a B2 systemization issue, not an A4 type-scale one (A4's gate covers text sizes, not icons).

## 3. Own score change

**A1: 9 → 8/12.** My original deduction covered only the Bubble.tsx labeling problem. Review A's independently-verified `animate-pulse`/reduced-motion miss is a second, distinct, gate-invisible violation of the same rubric line ("reduced-motion honored... screen-reader labels on controls"). Two confirmed misses on the app's primary screen and its loading state warrant one more point off, not a revision toward the group's 11-12.

```json
{"revisedScores": {"A1": 8}}
```
