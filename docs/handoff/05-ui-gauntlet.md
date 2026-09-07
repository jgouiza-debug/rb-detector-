# Pip — The UI Gauntlet (Scoring System + Self-Improving Loop)

A closed loop that researches, builds, and judges Pip's UI until it earns a real 99/100. The word "real" is doing a lot of work in that sentence. This doc exists because the naive version of this loop is a well-documented way to manufacture a fake score, and we are building the version that can't.

The machinery that implements this doc lives in [`/gauntlet`](../../gauntlet/README.md). Read this top to bottom, then paste the master prompt at the end into Claude Code / Cowork.

---

## 0. Read this first: why the obvious version fails

The obvious design is: one agent changes the UI, another agent scores it, loop until the score hits 99. This breaks in a specific, studied way.

- **Iterative self-refinement hacks its own evaluator.** When a system both produces and grades work, the score climbs while real quality stalls. In controlled runs the judge's pass rate has been driven far above true quality. The output gets *more convincing, not more correct*.
- **Shared context makes it worse.** When the judge can see the builder's reasoning and self-claims, it gets talked into higher scores. A judge that only sees the finished artifact (not the pitch for it) resists this.
- **Models flatter their own kind.** A single judge rates work in its own style/family higher (self-preference bias). One judge is a biased judge.
- **Perfect scores hide broken products.** Teams running these loops in production have watched agents hit 100% by gaming the metric while true capability sat far lower.

Three defenses, built into everything below:

1. **De-anchor the judge.** The council scores the *rendered UI*, never the builder's notes, reasoning, or self-assessment. Fresh eyes every round.
2. **Deterministic gates the judge cannot override.** Contrast, touch targets, spacing grid, console errors, performance. Measured by tools, not opinion. These cap the score. A 99 is impossible if a gate fails, no matter how much the council likes the look.
3. **A jury, not a judge.** The llm-council method: five independent advisors, anonymized peer review, a chair synthesis. Diversity of perspective (and ideally of model) beats any single grader.

And one human gate: the council can *nominate* a 99, but a human ratifies it with a real first-use test. That is the honest definition of done.

---

## 1. The scoring system (100 points)

Three tiers. Tier A is machine-measured and non-negotiable. Tiers B and C are council-scored but every score needs concrete evidence (a hex value, a measured pixel gap, a named screen), never a vibe.

### Tier A — Objective gates (40 pts). Machine-measured. Hard failures cap the whole score.

| # | Criterion | Points | How it's checked |
|---|---|---|---|
| A1 | **Accessibility.** All text meets WCAG AA (4.5:1 body, 3:1 large). Focus states present. Reduced-motion honored. Screen-reader labels on controls. | 12 | axe-core + measured rendered contrast + focus probe |
| A2 | **Touch & ergonomics.** Every interactive target >= 44px. Primary actions in the thumb zone. | 8 | Playwright element measurement |
| A3 | **Spatial system.** Spacing conforms to an 8pt grid. Consistent margins/padding. Nothing misaligned. | 8 | Measured box metrics vs 8pt |
| A4 | **Type & color systems.** <= 6 type sizes, <= 3 families (the brand book's three-role system), <= 3 weights. Palette follows 70/20/10, no muddy/mushed colors, all combos pass AA. | 6 | Computed styles audit + pixel-coverage histogram |
| A5 | **Correctness & performance.** No console errors, no layout shift (CLS), fast first paint, no broken or dead-end states, no sideways scroll. | 6 | Console capture + performance observers |

> Note on A4 families: the generic rubric says <= 2. Pip's brand book mandates Fredoka / Nunito Sans / Fraunces as three distinct roles, so the gate is set at 3. Tighten it in `gauntlet/lib/report.ts` if the brand changes.

### Tier B — Craft & taste (35 pts). Council-scored with evidence.

| # | Criterion | Points | What "high" looks like |
|---|---|---|---|
| B1 | **Visual hierarchy.** One clear focal point per screen. Deliberate emphasis and suppression. | 8 | Eye lands in the right place instantly |
| B2 | **Consistency & systemization.** Reusable components, one coherent visual language, zero one-off patterns. | 7 | Every screen feels like the same app |
| B3 | **Micro-interactions & feedback.** Press/active states, skeletons not spinners, staggered reveals, 150-300ms timing, every action confirms itself. | 7 | It feels physically responsive |
| B4 | **Motion quality.** Purposeful, calm, on-brand. Nothing gratuitous. Reduced-motion respected. | 5 | Motion lowers the heart rate |
| B5 | **Originality (the anti-vibe-coded score).** A specific point of view. No default gradients, no template smell, no repeated card-grid filler, copy is product-specific not SaaS boilerplate. | 8 | It could only be Pip, not "any app" |

### Tier C — Product & emotional fit (25 pts). Council-scored against Pip's goal.

| # | Criterion | Points | What "high" looks like |
|---|---|---|---|
| C1 | **Cognitive load / simplicity.** Progressive disclosure, one primary action per screen, no clutter. (This is the "smoothen out, too many things" fix.) | 7 | Never overwhelmed, always one obvious next step |
| C2 | **Brand & emotional resonance.** Warm companion feel, Pip present and alive, judgment-free. Users feel supported, not fixed. | 7 | Feels like texting a friend who gets you |
| C3 | **Delight with purpose.** Delightful moments that reinforce the behavior (celebrations, the memory reveal), never decoration for its own sake. | 6 | Every nice moment earns its place |
| C4 | **Flow & friction.** Capture in <= 2 taps. Onboarding < 60s. The timeline payoff lands. Paywall tone matches the soft product tone. | 5 | The core loop feels effortless |

### Hard caps (anti-inflation, non-overridable)

- Any WCAG contrast failure → total capped at **70**.
- Any primary action under 44px, or unreachable in the thumb zone → capped at **80**.
- Any console error, broken flow, dead-end state, or sideways scroll → capped at **75**.
- Any **regression** (a criterion that passed last round now fails) → the round scores **zero improvement**, fix it before anything else.
- **99-100 is unlocked only when ALL of these are true:** every Tier A gate passes, council median >= 97, zero red-flag vibe-coded tells present, and a human ratifies via a real first-use test.

### The vibe-coded red-flag checklist (any hit blocks a 99)

Straight from what practitioners flag as AI-slop tells. Each is a hard red flag, not a soft deduction:

- Default or generic gradients (the purple-blue "under construction" look, or any unmotivated gradient).
- Default framework spacing (untouched Tailwind defaults, everything the same padding).
- Too many colors or fonts (more than the system allows), colors mushed together with no 70/20/10 discipline.
- Repeated card/badge grids used as filler, identical section shapes stacked down the page.
- Generic copy that could belong to any app ("everything you need," "built for," "powerful features").
- Glassmorphism, blur, or animation used because it's possible, not because it helps.
- Wrong balance: fonts too big or too small, cramped or floaty spacing, no breathing room.

---

## 2. The loop (the gauntlet)

Five roles plus an orchestrator. The builder and the council are deliberately kept apart.

```
        ┌──────────────────────────────────────────────────────────┐
        │  RESEARCHER (once, refresh every 4 rounds)                 │
        │  Maintains the Taste Brief: current best practices +      │
        │  competitor patterns (Finch, Duolingo, Stoic, How We Feel)│
        └───────────────────────────┬──────────────────────────────┘
                                    ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  1. BUILDER  implements changes: round 1 = baseline audit fixes,│
   │     later rounds = act on last round's top fixes. Then RENDERS  │
   │     screenshots of every key screen. (Its reasoning stays with  │
   │     it. The council will never see it.)                          │
   └───────────────────────────┬────────────────────────────────────┘
                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  2. GATE RUNNER  runs machine checks on the live build:         │
   │     axe/Lighthouse (a11y, perf), Playwright (touch targets,     │
   │     spacing, console errors). Emits the hard-gate report.        │
   └───────────────────────────┬────────────────────────────────────┘
                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  3. THE COUNCIL  (run the llm-council skill). 5 advisors score  │
   │     INDEPENDENTLY from screenshots + code + rubric + gate report│
   │     only. Anonymized peer review. Chair synthesizes: scorecard, │
   │     top 3 fixes (highest leverage first), regression check.      │
   └───────────────────────────┬────────────────────────────────────┘
                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  4. ORCHESTRATOR  updates the scoreboard + regression ledger,   │
   │     enforces caps, decides:                                      │
   │       • gate fail or regression → force-fix, no credit           │
   │       • median >= 97 + gates pass + zero red flags → HUMAN gate  │
   │       • else → send top fixes to Builder, next round             │
   │     Stop if: max rounds hit, OR improvement < 2 pts over 2 rounds│
   │       (halt + escalate to human with a diagnosis).               │
   └────────────────────────────────────────────────────────────────┘
                               ▼
   ┌────────────────────────────────────────────────────────────────┐
   │  5. HUMAN RATIFICATION  real first-use test on the live app.    │
   │     Pass → certified 99+. Fail → notes become the next critique.│
   └────────────────────────────────────────────────────────────────┘
```

### The five council advisors (distinct lenses, ideally distinct models)

Give each its own persona and let it own a slice of the rubric, but each rates the whole and defends it with evidence. Full personas: [`gauntlet/council/PERSONAS.md`](../../gauntlet/council/PERSONAS.md).

1. **The Systems Designer** — grid, spacing, type scale, color system, consistency (owns A3, A4, B2).
2. **The Taste Critic** — the "senior designer who spots slop." Originality, point of view, vibe-coded tells (owns B5 + the red-flag checklist).
3. **The Interaction Engineer** — micro-interactions, states, motion, feedback, performance feel (owns B3, B4, A5).
4. **The Ergonomics & Accessibility Auditor** — contrast, touch targets, thumb zones, reduced motion, cognitive load (owns A1, A2, C1).
5. **The User & Brand Advocate** — a Gen Z journaler plus the Pip brand guardian. Emotional resonance, warmth, delight-with-purpose, "would I use and pay for this" (owns C2, C3, C4).

Cross-model diversity is the point. If the environment can run more than one model family, spread the advisors across them. If not, force genuinely distinct personas and evaluate in a randomized order each round to blunt positional bias.

---

## 3. Anti-gaming guardrails (the rules that keep the score honest)

Bake these into the council and orchestrator:

- **The council never sees the builder's reasoning, self-score, or promises.** Only screenshots, code, the rubric, and the gate report.
- **Every score needs concrete evidence.** A hex, a measured gap, a named screen, a specific element. "Looks clean" scores nothing.
- **Penalize length and persuasion.** A longer or more confident write-up is not a better UI. Reward specificity, not eloquence.
- **The gate report is ground truth.** The council cannot argue a failed contrast check into a pass.
- **Regression ledger.** Track every criterion that has ever passed. If one regresses, that is the only thing the next round fixes.
- **Iteration cap.** Hard stop at 8-10 rounds. If the score plateaus (< 2 pts gained over 2 rounds), halt and hand a human the diagnosis. Grinding past a plateau is where the loop starts gaming itself.
- **Human ratifies the 99.** The loop nominates. A person confirms with a real first-use test. The vibe-coded trap is that a UI passes a demo but fails a real user's first ten minutes, so the finish line is a real user's first ten minutes.

---

## 4. What you need in the environment before running it

- The Pip app building locally (`pnpm build`). The gate runner boots its own production server on port 3200 with a throwaway pglite database.
- **Playwright** (screenshots, element size/position measurement, console capture) and **axe-core** (`@axe-core/playwright`), both already devDependencies.
- The **llm-council** skill available, or the council prompts in `gauntlet/council/` which reproduce the method inline.
- The six Pip docs in `/docs/handoff` so every agent shares the same brand and product truth.

---

## 5. THE MASTER PROMPT

Paste this into Claude Code / Cowork to run the gauntlet. It is self-contained: it embeds the rubric, the roles, the guardrails, and the loop.

```
You are the ORCHESTRATOR of a self-improving UI refinement loop for Pip, a warm
journaling + meditation companion PWA (a yellow mascot you text; see /docs/handoff for
the PRD, brand, and design specs). Your job is to drive Pip's UI to a REAL 99/100 on the
rubric below, without letting the loop inflate its own score. The machinery is in
/gauntlet (read gauntlet/README.md first): `GAUNTLET_ROUND=NN pnpm gauntlet:gates` runs
the gate runner, `pnpm gauntlet:score NN` runs the orchestrator maths.

READ FIRST — why this is engineered the way it is:
A loop where an AI builds and an AI judges, run until the judge says 99, reliably
produces a fake 99 (iterative self-refinement reward hacking). You will prevent this
with three hard rules that override everything else:
  1) DE-ANCHOR: the Council scores only the rendered screenshots + code + machine
     gate report. It never sees the Builder's reasoning, self-score, or claims.
  2) MACHINE GATES WIN: objective checks (contrast, touch targets, spacing, console,
     performance) are measured by tools and cap the score. The Council cannot override
     a failed gate.
  3) JURY, NOT JUDGE: judging runs the llm-council method (5 independent advisors,
     anonymized peer review, chair synthesis). Spread advisors across model families
     if possible.

ROLES you coordinate:
- RESEARCHER: once at start (refresh every 4 rounds), produce a short Taste Brief of
  current UI best practices + patterns from Finch, Duolingo, Stoic, How We Feel that
  fit a warm, low-pressure companion app. All agents reference it (gauntlet/taste-brief.md).
- BUILDER: implements changes (round 1 = fix the baseline audit; later = execute the
  Council's top 3 fixes). Then `pnpm build` and run the gate runner, which renders
  screenshots of every key screen: onboarding, thread, timeline, memory card, meditation,
  settings, paywall, help, crisis. Its reasoning stays private to it
  (gauntlet/rounds/round-NN/builder-notes.md, which the Council must not read).
- GATE RUNNER: on the live build, run axe-core (accessibility) and Playwright (measure
  every interactive target >=44px, verify 8pt spacing, capture console errors, check
  layout shift, contrast, focus, reduced motion, overflow). Emit a pass/fail gate report
  with numbers (gauntlet/rounds/round-NN/gate-report.md).
- COUNCIL (run the llm-council skill; if unavailable, reproduce it with the prompts in
  gauntlet/council/): 5 advisors, each a distinct persona, each scoring the FULL rubric
  from screenshots + code + gate report ONLY, with concrete evidence (hex, measured px,
  named screen) for every score:
    1. Systems Designer (grid, spacing, type scale, color system, consistency)
    2. Taste Critic (originality, point of view, vibe-coded red flags)
    3. Interaction Engineer (micro-interactions, states, motion, feedback, perf feel)
    4. Ergonomics & Accessibility Auditor (contrast, targets, thumb zone, cognitive load)
    5. User & Brand Advocate (Gen Z journaler + Pip brand: warmth, delight-with-purpose,
       would-I-use-and-pay)
  Randomize advisor order each round. Advisors peer-review each other anonymized. A CHAIR
  synthesizes: the scorecard, the top 3 highest-leverage fixes, and a regression check
  (gauntlet/rounds/round-NN/council/scorecard.json + council-report.md).

RUBRIC (100 pts):
TIER A — Objective, machine-measured (40): A1 Accessibility/WCAG AA (12), A2 Touch
targets >=44px + thumb zone (8), A3 8pt spacing grid + alignment (8), A4 Type system
(<=6 sizes, <=3 families per the brand's three-role system, <=3 weights) + color 70/20/10
all AA (6), A5 No console errors, no layout shift, fast paint, no dead ends, no sideways
scroll (6).
TIER B — Craft & taste, council-scored with evidence (35): B1 Visual hierarchy (8),
B2 Consistency/systemization (7), B3 Micro-interactions & feedback, 150-300ms, skeletons
not spinners (7), B4 Motion quality, purposeful & calm (5), B5 Originality / not
vibe-coded, specific point of view, product-specific copy (8).
TIER C — Product & emotional fit (25): C1 Cognitive load / progressive disclosure /
one primary action per screen (7), C2 Brand & emotional resonance, warm, judgment-free,
"supported not fixed" (7), C3 Delight with purpose (6), C4 Flow & friction: capture <=2
taps, onboarding <60s, timeline payoff lands, paywall tone matches product tone (5).

HARD CAPS (non-overridable):
- Any contrast failure -> total capped at 70.
- Any primary action <44px or outside thumb zone -> capped at 80.
- Any console error / broken flow / dead end / sideways scroll -> capped at 75.
- Any regression -> round scores zero improvement; fix it first.
- 99-100 unlocks ONLY when: all Tier A gates pass AND council median >=97 AND zero
  vibe-coded red flags AND a human ratifies via a real first-use test.

VIBE-CODED RED FLAGS (any one blocks a 99): default/generic gradients; default framework
spacing; too many colors/fonts or mushed colors (no 70/20/10); repeated card-grid filler;
generic could-be-any-app copy; glassmorphism/blur/animation with no purpose; wrong balance
(fonts too big/small, cramped or floaty).

ANTI-GAMING RULES:
- Council sees screenshots + code + gate report only, never the Builder's notes.
- Every score cites concrete evidence or it is void.
- Do not reward length or confidence; reward specificity.
- The gate report is ground truth.
- Maintain a regression ledger across rounds (gauntlet/ledger.json, kept by the
  orchestrator script).

LOOP:
0. Researcher writes the Taste Brief.
1. Builder implements next changes, rebuilds, and runs the gate runner (which renders
   all key-screen screenshots).
2. Gate Runner produces the machine gate report.
3. Council scores (llm-council), returns scorecard + top 3 fixes + regression check.
4. You (Orchestrator) run `pnpm gauntlet:score NN`, which updates the scoreboard +
   regression ledger, enforces caps, and prints the decision:
   - gate fail or regression -> FORCE-FIX next round, no credit.
   - median >=97 + gates pass + zero red flags -> ESCALATE-TO-HUMAN ratification.
   - else -> CONTINUE: hand the top 3 fixes to the Builder, go to step 1.
   STOP (HALT) if max 10 rounds reached OR improvement <2 pts over 2 rounds -> give the
   human a diagnosis (what's stuck and why).

OUTPUT EACH ROUND, in this exact order:
1. Round number + one-line change summary.
2. Gate report table (each Tier A check: value + pass/fail).
3. Council scorecard: every criterion's score + one line of evidence, then the median,
   then any caps applied, then red flags found.
4. Top 3 fixes for next round, highest leverage first.
5. Regression ledger status.
6. Decision: CONTINUE / FORCE-FIX / ESCALATE-TO-HUMAN / HALT, with the reason.

Begin with round 0 (Researcher + baseline audit of the current UI against the rubric),
then run the loop. Never declare 99 yourself; nominate it and wait for the human.
```

---

## 6. How to run it (short version)

1. `pnpm install`, then `pnpm gauntlet` once for a clean baseline (reset + build + gates).
2. Paste the master prompt into Claude Code / Cowork.
3. Let it run rounds. Read `gauntlet/rounds/round-NN/verdict.md` and `gauntlet/scoreboard.md`. When it escalates to you, do the real first-use test yourself. That's the gate that certifies the 99.
4. If it halts on a plateau, read the diagnosis. A plateau usually means a rubric criterion needs a human judgment call, not more grinding.

A note on cost: this loop is token-hungry (a builder, five advisors, and gate runs, every round). Keep the iteration cap tight, run the researcher once rather than every round, and use a strong-but-efficient model for the advisors. A tight, honest 6-round run beats an unbounded grind that games itself into a fake 99.
