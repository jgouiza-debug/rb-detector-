# Gate report — round 08

Generated 2026-09-08T14:13:44.722Z · viewport 390×844 · 23 screen renders (8 dark)

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
| A1.focus | Keyboard focus indicator visible on tabbed controls | 80/80 | PASS |  |
| A1.reducedMotion | Animations still running under prefers-reduced-motion | 0 | PASS |  |
| A2.targets | Interactive targets under 44×44 (block-level) | 0/123 | PASS |  |
| A2.inline | Inline text links under 44px (WCAG 2.5.8 exempt, advisory) | 0 | PASS |  |
| A2.primary | Primary action present, ≥44px, on screen at landing, in the thumb zone (CTAs) | 23/23 | PASS |  |
| A3.grid8 | Spacing values on the 8pt grid | 94.6% | PASS | off-8 values (count): 4px×149, 12px×4 |
| A3.grid4 | Spacing values off even the 4pt half-grid | 0 | PASS |  |
| A3.void | Empty ground below the last content on a non-scrolling screen (advisory, >200px) | 0/23 screens | PASS | memory-card/light: 47px; meditation-pause/light: 150px; settings/light: 24px; settings-subscription/light: 24px; help/light: 24px; memory-card/dark: 47px; meditation-pause/dark: 150px; settings/dark: 24px |
| A3.align | Misaligned sibling blocks (distinct left edges among wide siblings, per screen max) | 0 | PASS |  |
| A4.sizes | Distinct type sizes across the app (≤ 6) | 6: 12, 14, 16, 18, 24, 32px | PASS |  |
| A4.families | Distinct font families (≤ 2) | 2: inter, newsreader | PASS |  |
| A4.weights | Distinct font weights (≤ 3) | 3: 400, 600, 700 | PASS |  |
| A4.palette | 70/20/10 proxy: neutral family ≥ 55% and neutral + two accents ≥ 85% of pixels | 23/23 screens | PASS |  |
| A5.console | Console errors / page errors / failed requests | 0 | PASS |  |
| A5.warnings | Console warnings (advisory) | 0 | PASS |  |
| A5.cls | Cumulative layout shift ≤ 0.1 on every screen | 23/23 | PASS |  |
| A5.fcp | First contentful paint ≤ 1800ms on every screen | 23/23 | PASS |  |
| A5.deadEnds | Dead-end screens (no primary action or < 2 controls) | 0 | PASS |  |
| A5.sticky | Sticky/fixed chrome still on screen after scrolling | 14/14 | PASS |  |
| A5.overflow | Screens that scroll sideways (horizontal overflow) | 0 | PASS |  |

## Per screen

| Screen | Theme | axe (serious+) | contrast fails | targets <44 (block) | primary | 8pt share | void below | CLS | FCP | dominant colour | console |
|---|---|---|---|---|---|---|---|---|---|---|---|
| onboarding-welcome | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 72ms | cream 89.2% (family 89.2%) | 0 |
| onboarding-name | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 40ms | cream 91.2% (family 91.2%) | 0 |
| onboarding-focus | light | 0 | 0 | 0/6 | 342×56 thumb-ok | 100% | scrolls | 0 | 44ms | cream 90.2% (family 90.2%) | 0 |
| onboarding-rhythm | light | 0 | 0 | 0/4 | 342×56 thumb-ok | 100% | scrolls | 0 | 36ms | cream 90.1% (family 90.1%) | 0 |
| onboarding-notify | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 44ms | cream 90.6% (family 90.6%) | 0 |
| thread | light | 0 | 0 | 0/6 | 44×44 thumb-ok | 96.9% | scrolls | 0 | 84ms | cream 70.6% (family 70.6%) | 0 |
| thread-composing-photo | light | 0 | 0 | 0/7 | 44×44 thumb-ok | 96.4% | scrolls | 0 | 68ms | cream 75.9% (family 75.9%) | 0 |
| timeline | light | 0 | 0 | 0/12 | 71×44 thumb-ok | 81.6% | scrolls | 0 | 180ms | surface 92.4% (family 92.4%) | 0 |
| memory-card | light | 0 | 0 | 0/2 | 44×44 zone n/a | 87.5% | 47px | 0 | 196ms | surface 94% (family 94%) | 0 |
| memory-locked-paywall | light | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.4% | scrolls | 0 | 76ms | surface 91.1% (family 91.1%) | 0 |
| meditation-pause | light | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 150px | 0 | 148ms | cream 96.4% (family 96.4%) | 0 |
| settings | light | 0 | 0 | 0/8 | 358×60 zone n/a | 97.5% | 24px | 0 | 72ms | cream 95.9% (family 95.9%) | 0 |
| settings-subscription | light | 0 | 0 | 0/2 | 358×56 thumb-ok | 81% | 24px | 0 | 64ms | cream 90% (family 90%) | 0 |
| help | light | 0 | 0 | 0/8 | 175×56 thumb-ok | 96.3% | 24px | 0 | 60ms | cream 90.3% (family 90.3%) | 0 |
| thread-crisis | light | 0 | 0 | 0/13 | 158×56 thumb-ok | 97.5% | scrolls | 0.015 | 60ms | pip-bubble 89.6% (family 89.6%) | 0 |
| onboarding-welcome | dark | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 48ms | night 88.7% (family 88.7%) | 0 |
| thread | dark | 0 | 0 | 0/6 | 44×44 thumb-ok | 96.9% | scrolls | 0 | 48ms | night 70.8% (family 70.8%) | 0 |
| thread-composing-photo | dark | 0 | 0 | 0/7 | 44×44 thumb-ok | 96.4% | scrolls | 0 | 48ms | night 76.1% (family 76.1%) | 0 |
| timeline | dark | 0 | 0 | 0/12 | 71×44 thumb-ok | 81.6% | scrolls | 0 | 92ms | ink 91.6% (family 91.6%) | 0 |
| memory-card | dark | 0 | 0 | 0/2 | 44×44 zone n/a | 87.5% | 47px | 0 | 84ms | ink 93.8% (family 93.8%) | 0 |
| memory-locked-paywall | dark | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.4% | scrolls | 0 | 56ms | ink 89.8% (family 89.8%) | 0 |
| meditation-pause | dark | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 150px | 0 | 48ms | night 96.1% (family 96.1%) | 0 |
| settings | dark | 0 | 0 | 0/8 | 358×60 zone n/a | 97.5% | 24px | 0 | 52ms | night 94.7% (family 94.7%) | 0 |

## Type system observed

- Sizes (6): 12, 14, 16, 18, 24, 32px
- Families (2): inter, newsreader
- Weights (3): 400, 600, 700

## Colour coverage (pixel share of the viewport, top 5; dominant = neutral family)

- onboarding-welcome/light: cream 88.5% · honey 5.4% · pip-bubble 0.7% · sunlight 0.6% · sunlight 0.4%
- onboarding-name/light: cream 84.7% · surface 6% · honey 5.6% · amber-ink 0.7% · night-text 0.3%
- onboarding-focus/light: cream 83.2% · surface 5.9% · honey 5.6% · ink 0.4% · night-text 0.4%
- onboarding-rhythm/light: cream 77.7% · surface 11.5% · honey 5.6% · line 0.4% · ink 0.4%
- onboarding-notify/light: cream 90.1% · honey 5.6% · pip-bubble 0.4% · ink 0.3% · sunlight 0.3%
- thread/light: cream 54.5% · user-bubble 22.2% · pip-bubble 11.7% · surface 3.5% · honey 0.5%
- thread-composing-photo/light: cream 59.9% · user-bubble 16.8% · pip-bubble 9.8% · surface 5.3% · amber-ink 0.7%
- timeline/light: surface 51.9% · cream 39.8% · sunlight 0.9% · ink 0.8% · night-soft 0.8%
- memory-card/light: surface 54.8% · cream 38.9% · sunlight 0.9% · ink 0.7% · night-text 0.1%
- memory-locked-paywall/light: surface 62.1% · cream 26.9% · honey 4.6% · line 0.8% · night-text 0.6%
- meditation-pause/light: cream 86.9% · pip-bubble 5.7% · surface 3.8% · sunlight 0.5% · pip-bubble 0.4%
- settings/light: cream 52.6% · surface 32.1% · night-text 9.2% · pip-bubble 1.5% · line 0.3%
- settings-subscription/light: cream 76.2% · surface 12.6% · honey 5.5% · pip-bubble 1% · ink-soft 0.2%
- help/light: cream 61.5% · surface 27.7% · honey 2.5% · line 0.5% · pip-bubble 0.4%
- thread-crisis/light: pip-bubble 37.1% · surface 28.1% · cream 22.7% · honey 3.1% · line 1.4%
- onboarding-welcome/dark: night 86.9% · honey 5.4% · ink 0.8% · sunlight 0.6% · sunlight 0.4%
- thread/dark: night 54.2% · user-bubble 22.2% · night-line 12.1% · ink 3.6% · night-bubble-pip 0.6%
- thread-composing-photo/dark: night 59.7% · user-bubble 16.8% · night-line 10.2% · ink 5.4% · sunlight 0.8%
- timeline/dark: ink 51.5% · night 39.5% · night-soft 0.9% · sunlight 0.9% · night-text 0.8%
- memory-card/dark: ink 54.4% · night 38.6% · sunlight 0.9% · night-text 0.7% · ink 0.3%
- memory-locked-paywall/dark: ink 40.8% · ink 25.8% · night 21.2% · honey 4.5% · night 0.9%
- meditation-pause/dark: night 85.6% · ink 5% · ink 4.5% · sunlight 0.5% · night-line 0.4%
- settings/dark: night 52.1% · ink 41% · ink 1.6% · night-line 0.3% · night-text 0.3%

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
