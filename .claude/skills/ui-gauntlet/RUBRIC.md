# Scoring rubric (100 points)

Every score needs concrete evidence: a hex value, a measured pixel gap, a named
screen, a specific element, a quoted string of copy. "Looks clean" scores
nothing. Reward specificity, never length or confidence.

Where this rubric says "the brand book", it means the project's own design
truth, named in `config.docs`. The rubric sets the shape; the project sets the
numbers.

## Tier A — Objective gates (40). Machine-measured. The gate report is ground truth.

| # | Criterion | Pts | Checked by |
|---|---|---|---|
| A1 | **Accessibility.** All text meets WCAG AA (4.5:1 body, 3:1 large). Focus states present. Reduced motion honoured. Screen-reader labels on controls. | 12 | axe-core + measured contrast + focus probe |
| A2 | **Touch & ergonomics.** Every interactive target ≥ 44px. Primary actions in the thumb zone. | 8 | Element measurement |
| A3 | **Spatial system.** Spacing on an 8pt grid. Consistent margins and padding. Nothing misaligned. | 8 | Computed box metrics vs 8pt |
| A4 | **Type & colour systems.** Within the project's declared size / family / weight limits. Palette follows 70/20/10, no muddy colours, all combinations pass AA. | 6 | Computed styles + pixel-coverage histogram |
| A5 | **Correctness & performance.** No console errors, no layout shift, fast first paint, no broken or dead-end states, no sideways scrolling, chrome survives scrolling. | 6 | Console capture + performance observers |

Advisors may score Tier A as a cross-check and should report anything the
machine missed. The orchestrator overwrites Tier A with the machine result.
**You cannot argue a failed gate into a pass.** A failed gate earns at most 60%
of its points however many sub-checks pass.

## Tier B — Craft & taste (35). Council-scored with evidence.

| # | Criterion | Pts | What "high" looks like |
|---|---|---|---|
| B1 | **Visual hierarchy.** One clear focal point per screen. Deliberate emphasis and suppression. | 8 | The eye lands in the right place instantly |
| B2 | **Consistency & systemization.** Reusable components, one coherent visual language, zero one-off patterns. | 7 | Every screen feels like the same app |
| B3 | **Micro-interactions & feedback.** Press states, skeletons not spinners, staggered reveals, 150–300ms timing, every action confirms itself. | 7 | It feels physically responsive |
| B4 | **Motion quality.** Purposeful, calm, on-brand. Nothing gratuitous. Reduced motion respected with intent, not just switched off. | 5 | Motion serves the product's emotional register |
| B5 | **Originality (anti-vibe-coded).** A specific point of view. No default gradients, no template smell, no card-grid filler. Copy is product-specific, not SaaS boilerplate. | 8 | It could only be *this* product |

## Tier C — Product & emotional fit (25). Council-scored against the product's stated goal.

| # | Criterion | Pts | What "high" looks like |
|---|---|---|---|
| C1 | **Cognitive load.** Progressive disclosure. One primary action per screen. Nothing asks more of the user than the moment warrants. | 7 | A tired person can use it |
| C2 | **Brand & emotional resonance.** The voice in the copy and the pixels match the brand book's own do/don't examples. | 7 | It feels like the thing it claims to be |
| C3 | **Delight with purpose.** Delightful moments that reinforce the behaviour, never decoration for its own sake. | 6 | Every nice moment earns its place |
| C4 | **Flow & friction.** The core loop is short. Onboarding is fast. The payoff lands. Monetisation tone matches the product tone. | 5 | The core loop feels effortless |

## Hard caps (anti-inflation, non-overridable)

Applied by the orchestrator from the gate JSON. Not subject to anyone's
judgement, including the chair's.

- Any WCAG contrast failure → total capped at **70**.
- Any primary action under 44px, or unreachable in the thumb zone → capped at **80**.
- Any console error, broken flow, **dead-end state**, or sideways scroll → capped at **75**.
- Any **regression** (a criterion that passed last round now fails) → the round
  scores **zero improvement**. Fix it before anything else.
- **99–100 unlocks only when all of these hold:** every Tier A gate passes, the
  council median is ≥ 97, zero red flags are present, and a human ratifies via a
  real first-use test.

A dead-end state is any reachable screen with no way forward. Terminal screens
count. If the screen list cannot reach it, that is a `fixture-completeness`
failure, not an absence of the defect.

## The red-flag checklist (any hit blocks a 99)

What practitioners flag as AI-slop tells. Each is a hard flag, not a soft
deduction. An advisor must name each hit with screen and element, or state
"none found" **and say what they checked**.

- Default or generic gradients — the purple-blue "under construction" look, or
  any unmotivated gradient.
- Default framework spacing left untouched (the Tailwind `p-5`/`gap-7` tells).
- Too many colours or fonts; muddy palette; no 70/20/10 discipline.
- Repeated card grids as filler.
- Generic could-be-any-app copy. "Unlock", "powerful", "journey", "everything
  you need".
- Glassmorphism, blur, or animation with no purpose — effects present because
  they were possible.
- Wrong balance: type too big or too small, cramped or floaty spacing, large
  voids of empty ground that read as unfinished rather than calm.

Two clarifications learned the hard way:

- A blur that hides **nothing** is theatre. Check what is behind it before
  crediting it as intentional.
- Distinguish a *pool of templated strings* from *repetition*. Six distinct
  lines that share one cadence still read as machine-written. Judge the cadence.
