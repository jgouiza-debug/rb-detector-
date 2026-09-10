# Gate report — round 06

Generated 2026-09-08T13:21:07.023Z · viewport 390×844 · 23 screen renders (8 dark)

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
| A2.targets | Interactive targets under 44×44 (block-level) | 0/124 | PASS |  |
| A2.inline | Inline text links under 44px (WCAG 2.5.8 exempt, advisory) | 0 | PASS |  |
| A2.primary | Primary action present, ≥44px, on screen at landing, in the thumb zone (CTAs) | 23/23 | PASS |  |
| A3.grid8 | Spacing values on the 8pt grid | 94.6% | PASS | off-8 values (count): 4px×149, 12px×4 |
| A3.grid4 | Spacing values off even the 4pt half-grid | 0 | PASS |  |
| A3.void | Empty ground below the last content on a non-scrolling screen (advisory, >200px) | 0/23 screens | PASS | meditation-pause/light: 144px; settings/light: 24px; settings-subscription/light: 24px; help/light: 24px; meditation-pause/dark: 144px; settings/dark: 24px |
| A3.align | Misaligned sibling blocks (distinct left edges among wide siblings, per screen max) | 0 | PASS |  |
| A4.sizes | Distinct type sizes across the app (≤ 6) | 6: 12, 14, 16, 18, 24, 32px | PASS |  |
| A4.families | Distinct font families (≤ 3, brand three-role system) | 3: fraunces, fredoka, nunito | PASS |  |
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
| onboarding-welcome | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 60ms | cream 89.6% (family 89.6%) | 0 |
| onboarding-name | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 44ms | cream 91.2% (family 91.2%) | 0 |
| onboarding-focus | light | 0 | 0 | 0/6 | 342×56 thumb-ok | 100% | scrolls | 0 | 40ms | cream 90.3% (family 90.3%) | 0 |
| onboarding-rhythm | light | 0 | 0 | 0/4 | 342×56 thumb-ok | 100% | scrolls | 0 | 48ms | cream 90.3% (family 90.3%) | 0 |
| onboarding-notify | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 44ms | cream 90.7% (family 90.7%) | 0 |
| thread | light | 0 | 0 | 0/6 | 44×44 thumb-ok | 96.9% | scrolls | 0 | 64ms | cream 62% (family 62%) | 0 |
| thread-composing-photo | light | 0 | 0 | 0/7 | 44×44 thumb-ok | 96.4% | scrolls | 0 | 48ms | cream 65.1% (family 65.1%) | 0 |
| timeline | light | 0 | 0 | 0/12 | 68×44 thumb-ok | 81.6% | scrolls | 0 | 84ms | surface 92.2% (family 92.2%) | 0 |
| memory-card | light | 0 | 0 | 0/2 | 44×44 zone n/a | 86.7% | scrolls | 0 | 108ms | surface 73.3% (family 73.3%) | 0 |
| memory-locked-paywall | light | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.4% | scrolls | 0 | 60ms | surface 90.8% (family 90.8%) | 0 |
| meditation-pause | light | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 144px | 0 | 44ms | cream 91.4% (family 91.4%) | 0 |
| settings | light | 0 | 0 | 0/8 | 358×60 zone n/a | 97.5% | 24px | 0 | 60ms | cream 96.3% (family 96.3%) | 0 |
| settings-subscription | light | 0 | 0 | 0/3 | 358×56 thumb-ok | 82.6% | 24px | 0 | 48ms | cream 90% (family 90%) | 0 |
| help | light | 0 | 0 | 0/8 | 175×56 thumb-ok | 96.3% | 24px | 0 | 40ms | cream 90.8% (family 90.8%) | 0 |
| thread-crisis | light | 0 | 0 | 0/13 | 158×56 thumb-ok | 97.5% | scrolls | 0.013 | 64ms | pip-bubble 89.8% (family 89.8%) | 0 |
| onboarding-welcome | dark | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 56ms | night 89.1% (family 89.1%) | 0 |
| thread | dark | 0 | 0 | 0/6 | 44×44 thumb-ok | 96.9% | scrolls | 0 | 56ms | night 62% (family 62%) | 0 |
| thread-composing-photo | dark | 0 | 0 | 0/7 | 44×44 thumb-ok | 96.4% | scrolls | 0 | 48ms | night 65.3% (family 65.3%) | 0 |
| timeline | dark | 0 | 0 | 0/12 | 68×44 thumb-ok | 81.6% | scrolls | 0 | 92ms | ink 91.4% (family 91.4%) | 0 |
| memory-card | dark | 0 | 0 | 0/2 | 44×44 zone n/a | 86.7% | scrolls | 0 | 76ms | ink 72.8% (family 72.8%) | 0 |
| memory-locked-paywall | dark | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.4% | scrolls | 0 | 56ms | ink 89.3% (family 89.3%) | 0 |
| meditation-pause | dark | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 144px | 0 | 48ms | night 91% (family 91%) | 0 |
| settings | dark | 0 | 0 | 0/8 | 358×60 zone n/a | 97.5% | 24px | 0 | 52ms | night 95.2% (family 95.2%) | 0 |

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
- thread/light: cream 48.7% · user-bubble 18.4% · sunlight 14.3% · pip-bubble 9.6% · surface 2.9%
- thread-composing-photo/light: cream 52.4% · sunlight 15.3% · user-bubble 13.8% · pip-bubble 8% · surface 4.3%
- timeline/light: surface 51.7% · cream 39.9% · ink 1.2% · sunlight 0.8% · night-soft 0.8%
- memory-card/light: surface 49.6% · cream 23.3% · sunlight 21.7% · ink 0.8% · sunlight 0.7%
- memory-locked-paywall/light: surface 60% · cream 28.2% · honey 4.6% · line 0.8% · night-text 0.6%
- meditation-pause/light: cream 86.8% · honey 5% · surface 3.9% · pip-bubble 0.7% · sunlight 0.5%
- settings/light: cream 54.8% · surface 32.5% · night-text 7.1% · pip-bubble 1.4% · line 0.3%
- settings-subscription/light: cream 71.5% · surface 12.6% · pip-bubble 5.7% · honey 5.4% · ink 0.3%
- help/light: cream 61.9% · surface 28.1% · honey 2.5% · line 0.5% · ink 0.3%
- thread-crisis/light: pip-bubble 37.6% · cream 28% · surface 22.7% · honey 2.5% · line 1.1%
- onboarding-welcome/dark: night 87.3% · honey 5.5% · ink 0.8% · sunlight 0.6% · sunlight 0.4%
- thread/dark: night 48.5% · user-bubble 18.4% · sunlight 14.3% · night-line 9.9% · ink 2.9%
- thread-composing-photo/dark: night 52.2% · sunlight 15.3% · user-bubble 13.8% · night-line 8.3% · ink 4.4%
- timeline/dark: ink 51.2% · night 39.6% · night-text 1.1% · night-soft 0.9% · sunlight 0.9%
- memory-card/dark: ink 49.2% · night 23% · sunlight 21.8% · night-text 0.8% · sunlight 0.7%
- memory-locked-paywall/dark: ink 39.1% · ink 25.3% · night 22.7% · honey 4.6% · night 0.9%
- meditation-pause/dark: night 85.5% · honey 5% · ink 4.6% · sunlight 0.5% · night-line 0.4%
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
