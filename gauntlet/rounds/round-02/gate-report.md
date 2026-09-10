# Gate report — round 02

Generated 2026-09-07T22:51:56.408Z · viewport 390×844 · 21 screen renders (7 dark)

## Tier A summary

| Gate | Result |
|---|---|
| A1 Accessibility | PASS |
| A2 Touch & ergonomics | PASS |
| A3 Spatial system | PASS |
| A4 Type & colour systems | PASS |
| A5 Correctness & performance | PASS |

Hard caps triggered: contrast→70: **no** · primary target→80: **no** · broken state→75: **no**

## Checks

| # | Check | Value | Pass | Detail |
|---|---|---|---|---|
| A1.axe | axe-core WCAG 2.x A/AA serious+critical violations | 0 | PASS |  |
| A1.contrast | Rendered text contrast failures (axe + measured) | 0 axe / 0 measured | PASS |  |
| A1.focus | Keyboard focus indicator visible on tabbed controls | 75/75 | PASS |  |
| A1.reducedMotion | Animations still running under prefers-reduced-motion | 0 | PASS |  |
| A2.targets | Interactive targets under 44×44 (block-level) | 0/203 | PASS |  |
| A2.inline | Inline text links under 44px (WCAG 2.5.8 exempt, advisory) | 0 | PASS |  |
| A2.primary | Primary action present, ≥44px, on screen at landing, in the thumb zone (CTAs) | 21/21 | PASS |  |
| A3.grid8 | Spacing values on the 8pt grid | 95.2% | PASS | off-8 values (count): 4px×96 |
| A3.grid4 | Spacing values off even the 4pt half-grid | 0 | PASS |  |
| A3.void | Empty ground below the last content on a non-scrolling screen (advisory, >200px) | 0/21 screens | PASS | onboarding-welcome/light: 198px; memory-card/light: 102px; meditation-pause/light: 144px; help/light: 24px; onboarding-welcome/dark: 198px; memory-card/dark: 102px; meditation-pause/dark: 144px |
| A3.align | Misaligned sibling blocks (distinct left edges among wide siblings, per screen max) | 0 | PASS |  |
| A4.sizes | Distinct type sizes across the app (≤ 6) | 6: 12, 14, 16, 18, 24, 32px | PASS |  |
| A4.families | Distinct font families (≤ 3, brand three-role system) | 3: fraunces, fredoka, nunito | PASS |  |
| A4.weights | Distinct font weights (≤ 3) | 3: 400, 600, 700 | PASS |  |
| A4.palette | 70/20/10 proxy: neutral family ≥ 55% and neutral + two accents ≥ 85% of pixels | 21/21 screens | PASS |  |
| A5.console | Console errors / page errors / failed requests | 0 | PASS |  |
| A5.warnings | Console warnings (advisory) | 0 | PASS |  |
| A5.cls | Cumulative layout shift ≤ 0.1 on every screen | 21/21 | PASS |  |
| A5.fcp | First contentful paint ≤ 1800ms on every screen | 21/21 | PASS |  |
| A5.deadEnds | Dead-end screens (no primary action or < 2 controls) | 0 | PASS |  |
| A5.overflow | Screens that scroll sideways (horizontal overflow) | 0 | PASS |  |

## Per screen

| Screen | Theme | axe (serious+) | contrast fails | targets <44 (block) | primary | 8pt share | void below | CLS | FCP | dominant colour | console |
|---|---|---|---|---|---|---|---|---|---|---|---|
| onboarding-welcome | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | 198px | 0 | 56ms | cream 89.6% (family 89.6%) | 0 |
| onboarding-name | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | 0px | 0 | 68ms | cream 91.1% (family 91.1%) | 0 |
| onboarding-focus | light | 0 | 0 | 0/6 | 342×56 thumb-ok | 100% | 0px | 0 | 52ms | cream 90.3% (family 90.3%) | 0 |
| onboarding-rhythm | light | 0 | 0 | 0/4 | 342×56 thumb-ok | 100% | 0px | 0 | 52ms | cream 90.3% (family 90.3%) | 0 |
| onboarding-notify | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | 0px | 0 | 48ms | cream 90.7% (family 90.7%) | 0 |
| thread | light | 0 | 0 | 0/35 | 44×44 thumb-ok | 98.9% | scrolls | 0 | 48ms | cream 68% (family 68%) | 0 |
| timeline | light | 0 | 0 | 0/12 | 68×44 thumb-ok | 82.1% | scrolls | 0 | 120ms | surface 93.1% (family 93.1%) | 0 |
| memory-card | light | 0 | 0 | 0/2 | 44×44 zone n/a | 85% | 102px | 0 | 112ms | surface 94.3% (family 94.3%) | 0 |
| memory-locked-paywall | light | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.3% | 0px | 0 | 52ms | surface 91% (family 91%) | 0 |
| meditation-pause | light | 0 | 0 | 0/4 | 320×56 thumb-ok | 100% | 144px | 0 | 48ms | cream 91.3% (family 91.3%) | 0 |
| settings | light | 0 | 0 | 0/8 | 358×60 zone n/a | 97.4% | 0px | 0 | 64ms | cream 96.3% (family 96.3%) | 0 |
| settings-subscription | light | 0 | 0 | 0/3 | 358×56 thumb-ok | 91.7% | 0px | 0 | 40ms | cream 93% (family 93%) | 0 |
| help | light | 0 | 0 | 0/8 | 175×56 thumb-ok | 96.2% | 24px | 0 | 36ms | cream 90.6% (family 90.6%) | 0 |
| thread-crisis | light | 0 | 0 | 0/46 | 158×56 thumb-ok | 99.1% | scrolls | 0.013 | 56ms | pip-bubble 89.4% (family 89.4%) | 0 |
| onboarding-welcome | dark | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | 198px | 0 | 60ms | night 89.1% (family 89.1%) | 0 |
| thread | dark | 0 | 0 | 0/35 | 44×44 thumb-ok | 98.9% | scrolls | 0 | 48ms | night 68.1% (family 68.1%) | 0 |
| timeline | dark | 0 | 0 | 0/12 | 68×44 thumb-ok | 82.1% | scrolls | 0 | 104ms | ink 90.3% (family 90.3%) | 0 |
| memory-card | dark | 0 | 0 | 0/2 | 44×44 zone n/a | 85% | 102px | 0 | 80ms | ink 92.9% (family 92.9%) | 0 |
| memory-locked-paywall | dark | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.3% | 0px | 0 | 52ms | ink 89.7% (family 89.7%) | 0 |
| meditation-pause | dark | 0 | 0 | 0/4 | 320×56 thumb-ok | 100% | 144px | 0 | 40ms | night 90.8% (family 90.8%) | 0 |
| settings | dark | 0 | 0 | 0/8 | 358×60 zone n/a | 97.4% | 0px | 0 | 68ms | night 95.2% (family 95.2%) | 0 |

## Type system observed

- Sizes (6): 12, 14, 16, 18, 24, 32px
- Families (3): fraunces, fredoka, nunito
- Weights (3): 400, 600, 700

## Colour coverage (pixel share of the viewport, top 5; dominant = neutral family)

- onboarding-welcome/light: cream 88.9% · honey 5.5% · pip-bubble 0.7% · sunlight 0.6% · sunlight 0.4%
- onboarding-name/light: cream 84.6% · surface 6% · honey 5.6% · amber-ink 0.7% · ink 0.3%
- onboarding-focus/light: cream 83.6% · surface 5.7% · honey 5.7% · ink 0.5% · night-text 0.4%
- onboarding-rhythm/light: cream 77.8% · surface 11.6% · honey 5.7% · line 0.4% · ink 0.4%
- onboarding-notify/light: cream 90.2% · honey 5.6% · pip-bubble 0.4% · ink 0.4% · sunlight 0.3%
- thread/light: cream 53% · user-bubble 26.2% · pip-bubble 11% · surface 2.9% · night-text 0.6%
- timeline/light: surface 53.1% · cream 37.3% · ink 1.4% · line 1% · pip-bubble 0.9%
- memory-card/light: surface 57.8% · cream 35.3% · pip-bubble 0.8% · ink 0.6% · #D8F8F8 0.2%
- memory-locked-paywall/light: surface 59.8% · cream 29% · honey 4.6% · line 0.8% · night-text 0.7%
- meditation-pause/light: cream 86.3% · honey 5% · surface 4.3% · pip-bubble 0.7% · sunlight 0.5%
- settings/light: cream 54.8% · surface 32.5% · night-text 7.1% · pip-bubble 1.4% · line 0.3%
- settings-subscription/light: cream 77.5% · surface 10.5% · honey 5.3% · pip-bubble 4.9% · ink 0.3%
- help/light: cream 48.8% · surface 41% · honey 2.5% · line 0.5% · ink 0.4%
- thread-crisis/light: pip-bubble 43.3% · surface 25% · cream 19.3% · honey 2.7% · line 1.2%
- onboarding-welcome/dark: night 87.3% · honey 5.5% · ink 0.8% · sunlight 0.6% · night-line 0.4%
- thread/dark: night 52.7% · user-bubble 26.2% · night-line 11.5% · ink 3% · night-bubble-pip 0.7%
- timeline/dark: ink 52.6% · night 37% · night-text 1.3% · line 1% · pip-bubble 0.7%
- memory-card/dark: ink 57.1% · night 35% · night-text 0.6% · pip-bubble 0.6% · ink 0.3%
- memory-locked-paywall/dark: ink 39.1% · ink 25% · night 23.4% · honey 4.6% · night 1%
- meditation-pause/dark: night 85% · honey 5% · ink 4.9% · sunlight 0.5% · night-line 0.4%
- settings/dark: night 54.3% · ink 39.4% · ink 1.5% · night-line 0.3% · #584848 0.2%

## axe violations (all impacts, WCAG + best-practice)

- none

## Console / network events

- none

## Reduced motion

- onboarding-welcome: 0 running animations
- onboarding-name: 0 running animations
- onboarding-focus: 0 running animations
- onboarding-rhythm: 0 running animations
- onboarding-notify: 0 running animations
- thread: 0 running animations
- timeline: 0 running animations
- meditation-pause: 0 running animations
