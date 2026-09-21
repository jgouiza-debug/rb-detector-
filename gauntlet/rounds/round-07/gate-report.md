# Gate report — round 07

Generated 2026-09-08T14:01:49.940Z · viewport 390×844 · 23 screen renders (8 dark)

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
| A3.void | Empty ground below the last content on a non-scrolling screen (advisory, >200px) | 0/23 screens | PASS | memory-card/light: 12px; meditation-pause/light: 150px; settings/light: 24px; settings-subscription/light: 24px; help/light: 24px; memory-card/dark: 12px; meditation-pause/dark: 150px; settings/dark: 24px |
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
| onboarding-welcome | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 64ms | cream 89.6% (family 89.6%) | 0 |
| onboarding-name | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 48ms | cream 91% (family 91%) | 0 |
| onboarding-focus | light | 0 | 0 | 0/6 | 342×56 thumb-ok | 100% | scrolls | 0 | 44ms | cream 90.3% (family 90.3%) | 0 |
| onboarding-rhythm | light | 0 | 0 | 0/4 | 342×56 thumb-ok | 100% | scrolls | 0 | 48ms | cream 90.3% (family 90.3%) | 0 |
| onboarding-notify | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 40ms | cream 90.7% (family 90.7%) | 0 |
| thread | light | 0 | 0 | 0/6 | 44×44 thumb-ok | 96.9% | scrolls | 0 | 60ms | cream 70.9% (family 70.9%) | 0 |
| thread-composing-photo | light | 0 | 0 | 0/7 | 44×44 thumb-ok | 96.4% | scrolls | 0 | 60ms | cream 76.3% (family 76.3%) | 0 |
| timeline | light | 0 | 0 | 0/12 | 68×44 thumb-ok | 81.6% | scrolls | 0 | 100ms | surface 92.2% (family 92.2%) | 0 |
| memory-card | light | 0 | 0 | 0/2 | 44×44 zone n/a | 87.5% | 12px | 0 | 108ms | surface 93.7% (family 93.7%) | 0 |
| memory-locked-paywall | light | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.4% | scrolls | 0 | 64ms | surface 90.8% (family 90.8%) | 0 |
| meditation-pause | light | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 150px | 0 | 48ms | cream 96.5% (family 96.5%) | 0 |
| settings | light | 0 | 0 | 0/8 | 358×60 zone n/a | 97.5% | 24px | 0 | 56ms | cream 96.3% (family 96.3%) | 0 |
| settings-subscription | light | 0 | 0 | 0/2 | 358×56 thumb-ok | 81% | 24px | 0 | 48ms | cream 90.3% (family 90.3%) | 0 |
| help | light | 0 | 0 | 0/8 | 175×56 thumb-ok | 96.3% | 24px | 0 | 44ms | cream 90.8% (family 90.8%) | 0 |
| thread-crisis | light | 0 | 0 | 0/13 | 158×56 thumb-ok | 97.5% | scrolls | 0.013 | 48ms | pip-bubble 89.7% (family 89.7%) | 0 |
| onboarding-welcome | dark | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 48ms | night 89.1% (family 89.1%) | 0 |
| thread | dark | 0 | 0 | 0/6 | 44×44 thumb-ok | 96.9% | scrolls | 0 | 48ms | night 71% (family 71%) | 0 |
| thread-composing-photo | dark | 0 | 0 | 0/7 | 44×44 thumb-ok | 96.4% | scrolls | 0 | 48ms | night 76.1% (family 76.1%) | 0 |
| timeline | dark | 0 | 0 | 0/12 | 68×44 thumb-ok | 81.6% | scrolls | 0 | 88ms | ink 91.4% (family 91.4%) | 0 |
| memory-card | dark | 0 | 0 | 0/2 | 44×44 zone n/a | 87.5% | 12px | 0 | 84ms | ink 93.2% (family 93.2%) | 0 |
| memory-locked-paywall | dark | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.4% | scrolls | 0 | 64ms | ink 89.3% (family 89.3%) | 0 |
| meditation-pause | dark | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 150px | 0 | 40ms | night 96.2% (family 96.2%) | 0 |
| settings | dark | 0 | 0 | 0/8 | 358×60 zone n/a | 97.5% | 24px | 0 | 60ms | night 95.2% (family 95.2%) | 0 |

## Type system observed

- Sizes (6): 12, 14, 16, 18, 24, 32px
- Families (3): fraunces, fredoka, nunito
- Weights (3): 400, 600, 700

## Colour coverage (pixel share of the viewport, top 5; dominant = neutral family)

- onboarding-welcome/light: cream 88.9% · honey 5.5% · pip-bubble 0.7% · sunlight 0.6% · sunlight 0.4%
- onboarding-name/light: cream 84.5% · surface 6% · honey 5.6% · amber-ink 0.7% · ink 0.3%
- onboarding-focus/light: cream 83.6% · surface 5.7% · honey 5.7% · ink 0.5% · night-text 0.4%
- onboarding-rhythm/light: cream 77.8% · surface 11.6% · honey 5.7% · line 0.4% · ink 0.4%
- onboarding-notify/light: cream 90.2% · honey 5.6% · pip-bubble 0.4% · ink 0.4% · sunlight 0.3%
- thread/light: cream 54.7% · user-bubble 22.7% · pip-bubble 11.8% · surface 3.5% · night-text 0.5%
- thread-composing-photo/light: cream 60% · user-bubble 17.2% · pip-bubble 10% · surface 5.4% · amber-ink 0.7%
- timeline/light: surface 51.7% · cream 39.9% · ink 1.2% · sunlight 0.8% · night-soft 0.8%
- memory-card/light: surface 59% · cream 34.1% · ink 1.1% · sunlight 0.9% · #D8F8F8 0.2%
- memory-locked-paywall/light: surface 60% · cream 28.2% · honey 4.6% · line 0.8% · night-text 0.6%
- meditation-pause/light: cream 86.9% · pip-bubble 5.7% · surface 3.9% · sunlight 0.5% · pip-bubble 0.4%
- settings/light: cream 54.8% · surface 32.5% · night-text 7.1% · pip-bubble 1.4% · line 0.3%
- settings-subscription/light: cream 76.6% · surface 12.6% · honey 5.5% · pip-bubble 0.9% · ink 0.2%
- help/light: cream 61.9% · surface 28.1% · honey 2.5% · line 0.5% · ink 0.3%
- thread-crisis/light: pip-bubble 36.2% · surface 27.9% · cream 23.8% · honey 3.1% · line 1.4%
- onboarding-welcome/dark: night 87.3% · honey 5.5% · ink 0.8% · sunlight 0.6% · night-line 0.4%
- thread/dark: night 54.4% · user-bubble 22.7% · night-line 12.2% · ink 3.6% · night-bubble-pip 0.6%
- thread-composing-photo/dark: night 59.8% · user-bubble 17.2% · night-line 10.4% · ink 5.4% · sunlight 0.8%
- timeline/dark: ink 51.2% · night 39.6% · night-text 1.1% · night-soft 0.9% · sunlight 0.9%
- memory-card/dark: ink 58.5% · night 33.8% · night-text 1.1% · sunlight 0.9% · ink 0.3%
- memory-locked-paywall/dark: ink 39.1% · ink 25.3% · night 22.7% · honey 4.6% · night 0.9%
- meditation-pause/dark: night 85.6% · ink 5.1% · ink 4.6% · sunlight 0.5% · night-line 0.4%
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
