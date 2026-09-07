# Pip UI Gauntlet

A closed loop that measures, judges and improves Pip's UI until it earns a real 99/100. The design, the rubric and the anti-gaming rules live in [`docs/handoff/05-ui-gauntlet.md`](../docs/handoff/05-ui-gauntlet.md). This folder is the machinery.

```
gauntlet/
  playwright.config.ts   gate runner config (port 3200, its own pglite dir)
  screens.ts             the key screens + how to reach each one
  gate.spec.ts           GATE RUNNER: screenshots + axe + measurements → gate report
  lib/measure.ts         browser-side measurement (targets, spacing, type, contrast, perf)
  lib/report.ts          gate evaluation + markdown rendering
  scripts/orchestrate.ts ORCHESTRATOR: gate report + council scorecard → caps, ledger, scoreboard
  council/               rubric, advisor briefing, personas, peer review, chair prompts
  taste-brief.md         the Researcher's brief (refresh every 4 rounds)
  scoreboard.md          one row per round
  ledger.json            regression ledger (which criteria have ever passed)
  rounds/round-NN/       screens/, gate-report.{json,md}, council/, verdict.md, builder-notes.md
```

## Run a round

```bash
# 1. Builder: make the changes, then rebuild.
pnpm build

# 2. Gate runner: renders every key screen (light + dark), writes rounds/round-NN.
GAUNTLET_ROUND=01 pnpm gauntlet:gates

# 3. Council: run five advisors (council/PERSONAS.md) with council/ADVISOR.md, then
#    peer review (council/PEER_REVIEW.md), then the chair (council/CHAIR.md), which
#    writes rounds/round-01/council/scorecard.json.

# 4. Orchestrator: apply Tier A points, caps, ledger; append to scoreboard; decide.
pnpm gauntlet:score 01
```

`pnpm gauntlet` does the reset + build + gates in one go for a fresh baseline.

## What the gates measure

| Gate | Measured how |
|---|---|
| A1 | axe-core (WCAG 2.x A/AA), rendered text contrast against the composited background, keyboard focus indicator on the first 10 tab stops, running animations under `prefers-reduced-motion` |
| A2 | Bounding box of every interactive element (≥ 44×44; inline text links reported separately per WCAG 2.5.8), the screen's primary action on-screen at landing and in the lower 60% for CTAs |
| A3 | Every computed padding/margin/gap: share on the 8pt grid, count off the 4pt half-grid, distinct left edges of wide blocks |
| A4 | Distinct font sizes/families/weights across the app, pixel-coverage colour histogram of each viewport (70/20/10 proxy: near-neutrals such as cream + white cards count as one family; changed after round 0, see round 1 verdict) |
| A5 | console.error / pageerror / 4xx-5xx responses, CLS, FCP, dead-end screens, horizontal overflow |

Thresholds are in `lib/report.ts`. They are deliberately strict; loosening one is a human decision and should be recorded in the round's verdict.

## Running the council honestly

Two failure modes cost real rounds here, both worth knowing before you spend tokens:

**Judge the code that produced the pixels.** Advisors must read the source as it was when the gate runner rendered the screenshots. Do NOT hand them an isolated git worktree unless you have verified it is checked out at that round's commit — a worktree cut from the session's base commit will show them stale code beside correct screenshots, and their code citations will be quietly wrong. The reliable order is: builder commits → gate runner renders → council reads the main checkout → builder starts the next round. If the builder must work in parallel, tell the advisors to score from screenshots and the gate report only, and say so in the round's council report.

**Spread the jury across model families.** A jury drawn from one small model will flatter the work: in round 1 a single-family jury returned a 96.5 median with 3 red flags where a mixed Opus/Sonnet/Fable jury on the same screenshots returned 75-90 with up to 6. The chair records `jury.confidence` for exactly this reason, and the orchestrator will not nominate a 99 from a low-confidence or single-family jury (it returns `RE-JUDGE`).

## Anti-gaming rules baked in

- The council reads only `screens/`, `gate-report.md`, the code, the rubric, the taste brief and the brand docs. `builder-notes.md` is for the builder alone.
- `orchestrate.ts` throws if any council score lacks evidence text.
- Tier A points come from the machine, never from the council.
- Caps are applied after the sum. A regression makes the round score zero improvement.
- A 99 can only be nominated by a jury the chair rates high-confidence across more than one model family, and never after a jump of more than 25 points in one round; otherwise the decision is RE-JUDGE.
- The loop nominates a 99; a human ratifies it with a real first-use test.
