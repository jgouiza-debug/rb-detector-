---
name: ui-gauntlet
description: Drive a UI to a defensible quality score through a closed build/measure/judge loop. Use when someone wants a UI made genuinely excellent, audited against a rubric, or protected from AI-slop tells - and when the loop must not be able to inflate its own score. Combines a deterministic Playwright/axe machine gate for objective criteria with a multi-model council for craft and product judgement.
---

# The UI Gauntlet

A scoring system that a build loop cannot cheat.

The premise: an agent asked to improve a UI and then grade its own work will
converge on a high number, not a good product. So the number comes from two
places that cannot both be talked into agreeing. Objective criteria are
measured by machine and are not negotiable. Subjective criteria go to a jury
of independent advisors on different model families, who never see the
builder's reasoning, then to an anonymized peer round, then to a chair who
takes medians. Hard caps sit above everything and are non-overridable.

If you are reading this to run a round, read `RUBRIC.md` next. If you are
setting the system up on a new project, start at **Setup**.

## The loop

```
build ──▶ machine gate ──▶ council ──▶ peer round ──▶ chair ──▶ orchestrator ──▶ ledger
  ▲            │              │                                      │
  │       Tier A (40)    Tier B+C (60)                          caps + medians
  └──────────────────── top 3 fixes ◀───────────────────────────────┘
```

One round is one pass. Rounds are capped at 8-10; see **Stopping**.

1. **Build.** Fix the previous chair's top-3, nothing else. Write
   `rounds/round-NN/builder-notes.md`. Never edit the gate to pass the gate.
2. **Preflight.** `pnpm gauntlet:preflight` - the guardrails in
   `scripts/preflight.ts`. A failure here is a hard stop, not a warning.
   These exist because every one of them was a real, expensive miss. See
   **Guardrails**.
3. **Gate.** `pnpm gauntlet:gates` renders every configured screen light and
   dark at the target viewport, runs axe, measures targets/spacing/type/colour,
   captures console and performance. Writes `gate-report.{json,md}`. This is
   ground truth for Tier A and it outranks any advisor.
4. **Council.** Five advisors (`council/PERSONAS.md`), one prompt
   (`council/ADVISOR.md`), spread across model families. They see screenshots,
   the gate report, and the source that produced the pixels - never the
   builder's notes, the scoreboard, the ledger, or git history.
5. **Peer round.** Each advisor's report is anonymized and cross-checked
   (`council/PEER_REVIEW.md`). Its job is falsification, not consensus.
6. **Chair.** `council/CHAIR.md` synthesises medians, voids evidence-free
   scores, verifies every red flag, and writes `scorecard.json`.
7. **Score.** `pnpm gauntlet:score -- NN` merges the gate and the scorecard,
   applies caps deterministically, checks the regression ledger, appends to
   the scoreboard.

## Setup

Copy `gate/`, `scripts/` and `council/` into the target repo under
`gauntlet/`, then write two files. Everything else is generic.

**`gauntlet/config.ts`** - see `config.example.ts` for the annotated contract:

- `viewport`, `themeToggle` (how the runner forces dark mode)
- `type: { maxSizes, maxFamilies, maxWeights }` - set from the project's own
  brand book, not from taste
- `palette` - hex → name, so reports read `honey` not `#F5B841`
- `sealedNamespaces` - design-token namespaces the project claims to control
  (`--text-*`, `--font-*`, `--radius-*`). Preflight verifies each is actually
  reset to `initial`
- `budgets` - FCP, CLS, grid conformance
- `docs` - paths to the brand book, design spec and taste brief the council
  treats as product truth
- `fixtureAdapters` / `productionAdapters` - which modules generate content
  under test vs in production. Read the warning in **Guardrails**.

**`gauntlet/screens.ts`** - the screen list. Each entry: `id`, `path`,
`primary` (selector for the single primary action), optional `setup`,
`ready`, `fullPage`, `thumbZone: false` for nav rows, `noReload` for
client-only state. Order matters: the run is one continuous session.

Then wire the scripts:

```json
"gauntlet:preflight": "tsx gauntlet/scripts/preflight.ts",
"gauntlet:gates":     "playwright test -c gauntlet/playwright.config.ts",
"gauntlet:score":     "tsx gauntlet/scripts/orchestrate.ts"
```

`examples/pip/` has both files filled in for a real app, plus its taste brief
and a note on what that example gets deliberately wrong.

## Guardrails

`scripts/preflight.ts`. Each check is here because it failed in production use
and cost real rounds. Do not disable one to get a round moving.

| Check | Catches | The incident |
|---|---|---|
| `fixture-completeness` | Routes the gate never renders | A terminal screen with zero interactive elements sat outside the screen list for nine rounds while the council hunted dead ends. Every A5 pass in that window was measured on a fixture that could not see it. |
| `state-completeness` | Sheets, dialogs and confirm steps behind state | A third font family shipped inside a modal no screen opened. The type gate passed nine times. |
| `token-seal` | Framework defaults leaking past a design system | Same incident. `--text-*` was reset to `initial`; `--font-*` never was, so the default mono stack still resolved. |
| `fixture-vs-production` | Scoring a test double as if it were the product | Four advisors and a chair spent eight rounds critiquing copy from an offline stub. The production adapter's prompt already did the thing they kept asking for. |
| `jury-diversity` | Self-preference and single-family inflation | A one-family jury returned 96.5. A mixed jury on identical screenshots returned 77. |
| `checkout-freshness` | Advisors reading a tree that never rendered | Worktrees cut from a stale base meant advisors cited code that was not in the screenshots. One caught it unprompted; the rest did not. |

`fixture-vs-production` does not fail the run. It stamps a banner into the
gate report and every advisor prompt: content on these screens is fixture
output, do not score it as product copy. Suppressing that banner is the single
easiest way to make this whole system produce a meaningless number.

## Anti-gaming rules

These are load-bearing. Removing one makes the score decorative.

- **Machine gates win.** An advisor may add a defect the machine missed. An
  advisor may never raise a failed gate.
- **Evidence or void.** Every score carries a hex, a measured px value, a named
  screen + element, or quoted copy. The chair discards the rest.
- **De-anchor the judge.** Advisors never see builder notes, the scoreboard,
  the ledger, previous scores, or commit messages. Score pixels, not intent.
- **Jury, not judge.** Medians of five, across model families. Never one model.
- **The builder never touches the gate.** Widening a threshold to pass is the
  failure mode this exists to prevent. Tightening one after a council find is
  correct and expected - that is how the sticky-chrome and empty-ground checks
  got in.
- **Caps are non-overridable.** They are applied by `orchestrate.ts` from the
  gate JSON, not by anyone's judgement.
- **A 99 needs a human.** See RUBRIC.md. The orchestrator will not nominate one
  from a low-confidence jury; it asks for a re-judge instead.

## Stopping

Halt and report when any holds:

- **Target met** - and ratified by a real first-use test, not by the council.
- **Plateau** - under 2 points gained across two consecutive rounds. Keep
  going only on an explicit instruction, and say plainly that the trend is flat.
- **Round cap** - 8 to 10. Past that, the loop is polishing what it can see and
  the remaining gap is usually architectural.
- **Oscillation** - the score moves up and down without trending. This means
  the jury is unstable or the rubric is being read differently each round;
  fix that before building anything else.

Report the honest number. A capped 75 with a missing navigation component is
not two rounds from 99, and saying so is the job.
