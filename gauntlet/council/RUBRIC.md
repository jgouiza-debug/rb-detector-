# Pip UI Gauntlet — Scoring rubric (100 points)

Every score needs concrete evidence: a hex value, a measured pixel gap, a named screen, a specific element. "Looks clean" scores nothing. Do not reward length or confidence; reward specificity.

## Tier A — Objective gates (40). Machine-measured. The gate report is ground truth.

| # | Criterion | Pts | Checked by |
|---|---|---|---|
| A1 | Accessibility. All text meets WCAG AA (4.5:1 body, 3:1 large). Focus states present. Reduced-motion honored. Screen-reader labels on controls. | 12 | axe-core + measured contrast + focus probe |
| A2 | Touch & ergonomics. Every interactive target ≥ 44px. Primary actions in the thumb zone. | 8 | Playwright element measurement |
| A3 | Spatial system. Spacing on an 8pt grid. Consistent margins/padding. Nothing misaligned. | 8 | Computed box metrics vs 8pt |
| A4 | Type & color systems. ≤ 6 type sizes, ≤ 3 families (brand three-role system), ≤ 3 weights. Palette follows 70/20/10, no muddy colors, all combos pass AA. | 6 | Computed styles + pixel coverage |
| A5 | Correctness & performance. No console errors, no layout shift, fast first paint, no broken or dead-end states, no sideways scrolling. | 6 | Console capture + perf observers |

Advisors may score Tier A as a cross-check, but the orchestrator overwrites Tier A with the machine result. You cannot argue a failed gate into a pass.

## Tier B — Craft & taste (35). Council-scored with evidence.

| # | Criterion | Pts | What "high" looks like |
|---|---|---|---|
| B1 | Visual hierarchy. One clear focal point per screen. Deliberate emphasis and suppression. | 8 | Eye lands in the right place instantly |
| B2 | Consistency & systemization. Reusable components, one coherent visual language, zero one-off patterns. | 7 | Every screen feels like the same app |
| B3 | Micro-interactions & feedback. Press/active states, skeletons not spinners, staggered reveals, 150–300ms timing, every action confirms itself. | 7 | It feels physically responsive |
| B4 | Motion quality. Purposeful, calm, on-brand. Nothing gratuitous. Reduced-motion respected. | 5 | Motion lowers the heart rate |
| B5 | Originality (anti-vibe-coded). A specific point of view. No default gradients, no template smell, no card-grid filler, copy is product-specific not SaaS boilerplate. | 8 | It could only be Pip, not "any app" |

## Tier C — Product & emotional fit (25). Council-scored against Pip's goal.

| # | Criterion | Pts | What "high" looks like |
|---|---|---|---|
| C1 | Cognitive load / simplicity. Progressive disclosure, one primary action per screen, no clutter. | 7 | Never overwhelmed, always one obvious next step |
| C2 | Brand & emotional resonance. Warm companion feel, Pip present and alive, judgment-free. Users feel supported, not fixed. | 7 | Feels like texting a friend who gets you |
| C3 | Delight with purpose. Delightful moments that reinforce the behavior (celebrations, the memory reveal), never decoration for its own sake. | 6 | Every nice moment earns its place |
| C4 | Flow & friction. Capture in ≤ 2 taps. Onboarding < 60s. The timeline payoff lands. Paywall tone matches the soft product tone. | 5 | The core loop feels effortless |

## Hard caps (non-overridable, applied by the orchestrator)

- Any WCAG contrast failure → total capped at 70.
- Any primary action under 44px, or unreachable in the thumb zone → capped at 80.
- Any console error, broken flow, dead-end state, or sideways scroll → capped at 75.
- Any regression (a criterion that passed last round now fails) → the round scores zero improvement.
- 99–100 unlocks only when every Tier A gate passes, council median ≥ 97, zero red flags, and a human ratifies via a real first-use test.

## Vibe-coded red flags (any hit blocks a 99; name the screen + element when you flag one)

- Default or generic gradients (purple-blue "under construction", or any unmotivated gradient).
- Default framework spacing (untouched Tailwind defaults, everything the same padding).
- Too many colors or fonts, or colors mushed together with no 70/20/10 discipline.
- Repeated card/badge grids used as filler, identical section shapes stacked down the page.
- Generic copy that could belong to any app ("everything you need", "built for", "powerful features").
- Glassmorphism, blur, or animation used because it's possible, not because it helps.
- Wrong balance: fonts too big or too small, cramped or floaty spacing, no breathing room.
