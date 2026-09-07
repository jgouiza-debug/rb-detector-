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

## Anti-gaming rules baked in

- The council reads only `screens/`, `gate-report.md`, the code, the rubric, the taste brief and the brand docs. `builder-notes.md` is for the builder alone.
- `orchestrate.ts` throws if any council score lacks evidence text.
- Tier A points come from the machine, never from the council.
- Caps are applied after the sum. A regression makes the round score zero improvement.
- The loop nominates a 99; a human ratifies it with a real first-use test.
