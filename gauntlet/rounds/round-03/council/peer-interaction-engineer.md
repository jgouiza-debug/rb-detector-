# Peer review — by Interaction Engineer

## 1. Ranking (best evidence first)
1. **D** — surgical, code-line-precise, zero rhetorical padding. Three distinct bugs I could reproduce from source (StepShell aria mismatch, SystemMoment missing `tap`, Bubble focusable-message burden), each with exact file:line and a mechanism, not just a vibe.
2. **C** — broadest coverage, ties gate+code+screenshot together, and is the only one who priced the scripted-copy defect against the actual product goal ("would I pay $4.99"). Slightly more rhetorical framing than D but every claim I checked held up.
3. **A** — heaviest pixel measurement (radius census I independently reproduced exactly: 21/3/2/17/1), but some dockings (B1 void-space) lean on advisory-only gate rows already marked PASS.
4. **B** — real findings (scripted.ts, dark-mode pill contrast) but visibly derivative of C's evidence in places (near-identical quotes/framing), less independently sourced.

## 2. Disputes
- **My own A1 (12/12) is wrong.** `components/onboarding/StepShell.tsx:11,16` — `aria-valuenow={step}`/`aria-valuemax={total}` computes 25/50/75%, but the rendered bar uses `(step+1)/(total+1)` = 40/60/80%. Confirmed by direct read; axe doesn't catch computed-vs-rendered ARIA mismatches. D is right; I hadn't opened this file.
- **My own A2 (8/8) is wrong.** `components/chat/SystemMoment.tsx:11` — the "day is ready" link has no `tap` class (`px-4 py-2` + `text-sm` ≈36px), confirmed in source; the gate's fixed fixture set never renders `day_ready` so 0/203 undersells the real floor. D's claim holds.
- **My own B5 (7/8) is wrong, and this is the real story of the round.** `lib/adapters/ai/scripted.ts::synthesizeDay` builds titles as `Array.from(new Set(nouns)).slice(0,3).join(", ")`. `timeline-light-full.jpg` shows the output verbatim: "Walk, under, amber" / "Quiet, evening, listened" / "Missed, friends, texted" / "Tried, recipe, worked" / "Hard, honestly, everything" — five identical comma-joined-noun cards stacked on the one screen the brand exists for. B and C are right; I never opened this file or the `-full` screenshot.
- **Review A's radius claim, verified independently:** `grep` gives `rounded-2xl`×21, `rounded-xl`×3, `rounded-3xl`×2 vs `rounded-card`×17/`rounded-field`×1 — exact match to A's count. Real, not padding. Docking my B2 to 6.
- **B's "unlock pip+" claim, verified:** `PaywallCard.tsx:40` `aria-label="unlock pip+"`; `docs/handoff/02-brand-guidelines.md:187` explicitly bans "unlock your best self." SR-only but a literal hit on the banned pattern — B is right and I missed it.

## 3. Score changes (evidence above)
A1 12→10, A2 8→7, B2 7→6, B5 7→5, C1 6→5, C3 5→4. Adding two red flags I'd missed: the scripted-title mail-merge (timeline-light-full.jpg) and `TopBar`'s `backdrop-blur-md` visibly ghosting a bubble behind the wordmark on `thread-light.jpg` (confirmed by eye) — blur-because-possible, distinct from the brand-sanctioned lock blur.

```json
{"revisedScores": {"A1": 10, "A2": 7, "B2": 6, "B5": 5, "C1": 5, "C3": 4}}
```
