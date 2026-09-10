# Peer review by Ergonomics & Accessibility Auditor

## 1. Ranking by evidentiary quality

1. **Review C** — best. Only review to actually read `scripted.ts`'s generation logic and find the specific defects (BRIDGES seam grammar, `sentence()`'s single-char capitalization, a 6-string mood-keyed closing map), each with a line-level mechanism, not just a vibe. Also the only one to give a coherent narrative verdict ("would I pay $4.99 tonight?") backed by every score above it.
2. **Review D** — near-best measurement discipline (pixel sampling, recomputed contrast, utility-class census for the radius ladder: 21 `rounded-2xl` vs 17 `rounded-card`, verified below) but internally inconsistent — see disputes 1 and 2.
3. **Review A** — good specifics (same `scripted.ts` BRIDGES tell, welcome-screen CTA void, memory-card date orphan) but leans more on screenshot reading than code for B5/C2/C3, and is less thorough than C/D on cross-checking its own claims against source.
4. **Review B** — weakest. Transparent about its screenshot-only method (a point in its favor), but it's the only review that never opens `scripted.ts` at all, and it's the only one to report zero red flags while still scoring B5/C3 in the top half — high scores it can't actually back against the one file everyone else found real bugs in.

## 2. Disputes

**Review D, A1**: they document `MessageList.tsx:20`'s ungated `scrollIntoView({behavior:"smooth"})` overriding `globals.css`'s reduced-motion `scroll-behavior:auto!important` — I confirmed this in source (`components/chat/MessageList.tsx:19`, `app/globals.css:281`), a genuine reduced-motion violation the gate can't see. Yet D scores A1 **12/12**, no deduction. Their own evidence contradicts their score; I'd cap it at 11/12, same class of dock I gave myself for out-of-gate-scope code bugs.

**Review D vs. Review C, "blur used because it's possible" (thread TopBar)**: D pixel-sampled the same `bg-bg/90 backdrop-blur-md` bleed-through as C (≤2/255 light) and called it "reads as a solid warm bar," not a hit. I opened `thread-light.jpg` directly: there is a visibly legible ghost of the "Sat, Sep 5" divider text sitting just under the wordmark, and the last bubble is visibly clipped above the composer. C's read is the one the pixels support; D's dismissal doesn't hold up against the actual render.

**Review B, B5/C2/C3**: their method note admits they didn't verify motion/generation code, but B5=7/8 and C3=5/6 are scored as if the keepsake copy were sound. I read `lib/adapters/ai/scripted.ts`: `closing` is a fixed 6-string map keyed only by `MoodTag` — any two days sharing a mood in one visible week get the identical closing line, and `BRIDGES` glues a random connective onto entry 2 regardless of how it starts (confirmed: `bridge = BRIDGES[seed % BRIDGES.length]` with no grammar check). This is real, code-verified template smell that B never surfaces. Their scores there should be treated as unverified, not void, but discounted.

**My own A1 (10/12) against a "clean" gate**: defended, not revised. `Bubble.tsx:23` gives every message a `<button aria-label="{sender}: {text} — tap for the time">` — confirmed verbatim in source — duplicating every message's text for screen-reader users. `StepShell.tsx:11,16` sets `aria-valuenow={step}`/`aria-valuemax={total}` (raw step/total, e.g. 1/4=25%) while the rendered bar width uses `(step+1)/(total+1)` (40%) — confirmed side-by-side in the same file. Neither is axe-detectable (valid ARIA values, just semantically wrong); the gate's 0-violations result is real but doesn't cover either bug.

**Review C, C2 dark-mode "iOS grey" claim**: `--night-bubble-pip: #33302a` (confirmed in `globals.css:24`) is a warm dark brown, not neutral — the claim of literal greyness overstates a real but smaller warmth-contrast gap than described.

## 3. Changes to my own scores

Reading `scripted.ts` directly (which I did not do in round 3) turned up real, code-verified template smell I missed entirely — zero red flags was wrong.

- **B5: 7 → 6** — the closing/bridge generator is genuine template smell in the keepsake, the highest-stakes copy surface.
- **C3: 6 → 5** — "a whole week, kept." is earned, but the day-to-day reflection closings are not: two same-mood days in one visible week get an identical sentence, which is decoration-by-formula, not an earned moment.
- Added red flag: `lib/adapters/ai/scripted.ts` closing map + BRIDGES connective — machine-copy tell in the reflection text.

```json
{"revisedScores": {"B5": 6, "C3": 5}}
```
