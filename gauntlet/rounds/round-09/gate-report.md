# Gate report — round 09

Generated 2026-09-08T22:23:19.795Z · viewport 390×844 · 36 screen renders (10 dark)

## Tier A summary

| Gate | Result |
|---|---|
| A1 Accessibility | PASS |
| A2 Touch & ergonomics | PASS |
| A3 Spatial system | PASS |
| A4 Type & colour systems | PASS |
| A5 Correctness & performance | FAIL |

Hard caps triggered: contrast→70: **no** · primary target→80: **no** · broken state→75: **YES**

## Checks

| # | Check | Value | Pass | Detail |
|---|---|---|---|---|
| A1.axe | axe-core WCAG 2.x A/AA serious+critical violations | 0 | PASS |  |
| A1.contrast | Rendered text contrast failures (axe + measured) | 0 axe / 0 measured | PASS |  |
| A1.focus | Keyboard focus indicator visible on tabbed controls | 119/119 | PASS |  |
| A1.reducedMotion | Animations still running under prefers-reduced-motion | 0 | PASS |  |
| A2.targets | Interactive targets under 44×44 (block-level) | 0/193 | PASS |  |
| A2.inline | Inline text links under 44px (WCAG 2.5.8 exempt, advisory) | 1 | PASS | settings-about/light: a "get help now" 95.9×20 |
| A2.primary | Primary action present, ≥44px, on screen at landing, in the thumb zone (CTAs) | 36/36 | PASS |  |
| A3.grid8 | Spacing values on the 8pt grid | 93.8% | PASS | off-8 values (count): 4px×241, 20px×8, 12px×4 |
| A3.grid4 | Spacing values off even the 4pt half-grid | 0 | PASS |  |
| A3.void | Empty ground below the last content on a non-scrolling screen (advisory, >200px) | 6/36 screens | PASS | memory-card/light: 47px; meditation-pause/light: 150px; settings/light: 24px; settings-subscription/light: 124px; help/light: 24px; settings-account/light: 448px; settings-notifications/light: 60px; settings-data/light: 307px; settings-about/light: 102px; goodbye/light: 218px; sign-in/light: 182px; offline/light: 236px; checkout-done/light: 266px; memory-card/dark: 47px; meditation-pause/dark: 150px; settings/dark: 24px; goodbye/dark: 218px |
| A3.align | Misaligned sibling blocks (distinct left edges among wide siblings, per screen max) | 0 | PASS |  |
| A4.sizes | Distinct type sizes across the app (≤ 6) | 6: 12, 14, 16, 18, 24, 32px | PASS |  |
| A4.families | Distinct font families (≤ 2) | 2: inter, newsreader | PASS |  |
| A4.weights | Distinct font weights (≤ 3) | 3: 400, 600, 700 | PASS |  |
| A4.palette | 70/20/10 proxy: neutral family ≥ 55% and neutral + two accents ≥ 85% of pixels | 36/36 screens | PASS |  |
| A5.console | Console errors / page errors / failed requests | 0 | PASS |  |
| A5.warnings | Console warnings (advisory) | 0 | PASS |  |
| A5.cls | Cumulative layout shift ≤ 0.1 on every screen | 36/36 | PASS |  |
| A5.fcp | First contentful paint ≤ 1800ms on every screen | 36/36 | PASS |  |
| A5.deadEnds | Dead-end screens (no primary action or < 2 controls) | 1 | FAIL | checkout-done/light |
| A5.sticky | Sticky/fixed chrome still on screen after scrolling | 24/24 | PASS |  |
| A5.overflow | Screens that scroll sideways (horizontal overflow) | 0 | PASS |  |

## Per screen

| Screen | Theme | axe (serious+) | contrast fails | targets <44 (block) | primary | 8pt share | void below | CLS | FCP | dominant colour | console |
|---|---|---|---|---|---|---|---|---|---|---|---|
| onboarding-welcome | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 96ms | cream 89.2% (family 89.2%) | 0 |
| onboarding-name | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 60ms | cream 91.3% (family 91.3%) | 0 |
| onboarding-focus | light | 0 | 0 | 0/6 | 342×56 thumb-ok | 100% | scrolls | 0 | 56ms | cream 90.2% (family 90.2%) | 0 |
| onboarding-rhythm | light | 0 | 0 | 0/4 | 342×56 thumb-ok | 100% | scrolls | 0 | 56ms | cream 90.1% (family 90.1%) | 0 |
| onboarding-notify | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 56ms | cream 90.6% (family 90.6%) | 0 |
| thread | light | 0 | 0 | 0/7 | 44×44 thumb-ok | 95.8% | scrolls | 0 | 64ms | cream 72.1% (family 72.1%) | 0 |
| thread-composing-photo | light | 0 | 0 | 0/8 | 44×44 thumb-ok | 95.3% | scrolls | 0 | 84ms | cream 76.7% (family 76.7%) | 0 |
| timeline | light | 0 | 0 | 0/13 | 71×44 thumb-ok | 79.9% | scrolls | 0 | 108ms | cream 92.7% (family 92.7%) | 0 |
| memory-card | light | 0 | 0 | 0/2 | 44×44 zone n/a | 87.5% | 47px | 0 | 120ms | surface 95.2% (family 95.2%) | 0 |
| memory-locked-paywall | light | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.4% | scrolls | 0 | 84ms | surface 91% (family 91%) | 0 |
| meditation-pause | light | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 150px | 0 | 72ms | cream 96.4% (family 96.4%) | 0 |
| settings | light | 0 | 0 | 0/8 | 358×60 zone n/a | 97.5% | 24px | 0 | 64ms | cream 95.9% (family 95.9%) | 0 |
| settings-subscription | light | 0 | 0 | 0/2 | 358×56 thumb-ok | 81.8% | 124px | 0 | 52ms | cream 89.8% (family 89.8%) | 0 |
| help | light | 0 | 0 | 0/8 | 175×56 thumb-ok | 96.3% | 24px | 0 | 44ms | cream 90.3% (family 90.3%) | 0 |
| thread-crisis | light | 0 | 0 | 0/14 | 158×56 thumb-ok | 96.6% | scrolls | 0.015 | 64ms | pip-bubble 92.5% (family 92.5%) | 0 |
| settings-account | light | 0 | 0 | 0/5 | 91×44 zone n/a | 90% | 448px | 0 | 56ms | cream 97.7% (family 97.7%) | 0 |
| settings-notifications | light | 0 | 0 | 0/12 | 91×44 zone n/a | 91.2% | 60px | 0 | 60ms | cream 88.5% (family 88.5%) | 0 |
| settings-data | light | 0 | 0 | 0/3 | 91×44 zone n/a | 84.8% | 307px | 0 | 52ms | cream 94.2% (family 94.2%) | 0 |
| settings-about | light | 0 | 0 | 0/1 | 91×44 zone n/a | 88.9% | 102px | 0 | 48ms | cream 90.3% (family 90.3%) | 0 |
| settings-delete-confirm | light | 0 | 0 | 0/6 | 342×48 thumb-ok | 90.4% | 0px | 0 | 44ms | surface 83.8% (family 83.8%) | 0 |
| goodbye | light | 0 | 0 | 0/2 | 342×44 thumb-ok | 69.2% | 218px | 0 | 48ms | cream 95.5% (family 95.5%) | 0 |
| sign-in | light | 0 | 0 | 0/3 | 293×56 thumb-ok | 100% | 182px | 0 | 44ms | cream 92.3% (family 92.3%) | 0 |
| offline | light | 0 | 0 | 0/2 | 342×48 thumb-ok | 100% | 236px | 0 | 48ms | cream 91.4% (family 91.4%) | 0 |
| thread-voice | light | 0 | 0 | 0/10 | 342×56 thumb-ok | 95.8% | scrolls | 0 | 68ms | surface 85.6% (family 85.6%) | 0 |
| email-link | light | 0 | 0 | 0/10 | 342×48 thumb-ok | 96% | scrolls | 0 | 88ms | surface 79.7% (family 79.7%) | 0 |
| checkout-done | light | 0 | 0 | 0/1 | 342×48 thumb-ok | 100% | 266px | 0 | 44ms | cream 92.2% (family 92.2%) | 0 |
| onboarding-welcome | dark | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 64ms | night 88.7% (family 88.7%) | 0 |
| thread | dark | 0 | 0 | 0/7 | 44×44 thumb-ok | 95.8% | scrolls | 0 | 64ms | night 72.3% (family 72.3%) | 0 |
| thread-composing-photo | dark | 0 | 0 | 0/8 | 44×44 thumb-ok | 95.3% | scrolls | 0 | 48ms | night 76.8% (family 76.8%) | 0 |
| timeline | dark | 0 | 0 | 0/13 | 71×44 thumb-ok | 79.9% | scrolls | 0 | 108ms | night 92.2% (family 92.2%) | 0 |
| memory-card | dark | 0 | 0 | 0/2 | 44×44 zone n/a | 87.5% | 47px | 0 | 96ms | ink 94.5% (family 94.5%) | 0 |
| memory-locked-paywall | dark | 0 | 0 | 0/3 | 310×56 thumb-ok | 94.4% | scrolls | 0 | 96ms | ink 89.8% (family 89.8%) | 0 |
| meditation-pause | dark | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 150px | 0 | 56ms | night 96.1% (family 96.1%) | 0 |
| settings | dark | 0 | 0 | 0/8 | 358×60 zone n/a | 97.5% | 24px | 0 | 56ms | night 94.7% (family 94.7%) | 0 |
| settings-delete-confirm | dark | 0 | 0 | 0/6 | 342×48 thumb-ok | 90.4% | 0px | 0 | 68ms | ink 83.1% (family 83.1%) | 0 |
| goodbye | dark | 0 | 0 | 0/2 | 342×44 thumb-ok | 69.2% | 218px | 0 | 36ms | night 95.1% (family 95.1%) | 0 |

## Type system observed

- Sizes (6): 12, 14, 16, 18, 24, 32px
- Families (2): inter, newsreader
- Weights (3): 400, 600, 700

## Colour coverage (pixel share of the viewport, top 5; dominant = neutral family)

- onboarding-welcome/light: cream 88.5% · honey 5.4% · pip-bubble 0.7% · sunlight 0.6% · sunlight 0.4%
- onboarding-name/light: cream 84.8% · surface 6% · honey 5.6% · amber-ink 0.7% · night-text 0.3%
- onboarding-focus/light: cream 83.2% · surface 5.9% · honey 5.6% · ink 0.4% · night-text 0.4%
- onboarding-rhythm/light: cream 77.7% · surface 11.5% · honey 5.6% · line 0.4% · ink 0.4%
- onboarding-notify/light: cream 90.1% · honey 5.6% · pip-bubble 0.4% · ink 0.3% · sunlight 0.3%
- thread/light: cream 57.9% · user-bubble 20.8% · pip-bubble 9.6% · surface 3.6% · night-text 0.6%
- thread-composing-photo/light: cream 65.1% · user-bubble 16.8% · pip-bubble 5.4% · surface 5.3% · amber-ink 0.7%
- timeline/light: cream 48.3% · surface 43.8% · sunlight 0.9% · night-soft 0.8% · ink 0.8%
- memory-card/light: surface 56.1% · cream 38.7% · ink 1% · sunlight 0.9% · night-text 0.2%
- memory-locked-paywall/light: surface 62% · cream 26.9% · honey 4.6% · line 0.8% · night-text 0.6%
- meditation-pause/light: cream 86.9% · pip-bubble 5.7% · surface 3.8% · sunlight 0.5% · pip-bubble 0.4%
- settings/light: cream 52.6% · surface 32.1% · night-text 9.2% · pip-bubble 1.5% · line 0.3%
- settings-subscription/light: cream 76% · surface 12.6% · honey 5.4% · pip-bubble 1% · ink 0.3%
- help/light: cream 61.5% · surface 27.7% · honey 2.5% · line 0.5% · pip-bubble 0.4%
- thread-crisis/light: pip-bubble 34.5% · cream 29.8% · surface 26.5% · line 1.3% · ink-soft 0.9%
- settings-account/light: cream 83.3% · surface 12.9% · pip-bubble 1.1% · #F8D898 0.4% · line 0.3%
- settings-notifications/light: cream 60.8% · surface 21.8% · honey 5.2% · pip-bubble 4.9% · ink 1.6%
- settings-data/light: cream 79.3% · surface 14.3% · honey 2% · line 0.3% · pip-bubble 0.2%
- settings-about/light: cream 88.7% · pip-bubble 0.8% · night-text 0.5% · ink 0.4% · #B87858 0.4%
- settings-delete-confirm/light: surface 82.2% · night-soft 10.7% · ink-soft 0.7% · line 0.6% · pip-bubble 0.5%
- goodbye/light: cream 95.1% · sunlight 0.4% · pip-bubble 0.4% · ink 0.3% · sunlight 0.3%
- sign-in/light: cream 86.7% · surface 5% · #F8D898 4.5% · pip-bubble 0.4% · sunlight 0.4%
- offline/light: cream 91% · honey 4.7% · sunlight 0.4% · pip-bubble 0.4% · sunlight 0.3%
- thread-voice/light: surface 85.2% · ink 11.5% · honey 0.6% · ink-soft 0.4% · night-text 0.2%
- email-link/light: surface 78.5% · #F8D898 13.3% · amber-ink 2% · line 0.7% · ink-soft 0.5%
- checkout-done/light: cream 91.7% · honey 4.7% · pip-bubble 0.5% · sunlight 0.5% · sunlight 0.3%
- onboarding-welcome/dark: night 86.9% · honey 5.4% · ink 0.8% · sunlight 0.6% · sunlight 0.4%
- thread/dark: night 57.6% · user-bubble 20.8% · night-line 10% · ink 3.6% · night-bubble-pip 0.6%
- thread-composing-photo/dark: night 64.9% · user-bubble 16.8% · night-line 5.8% · ink 5.3% · sunlight 0.7%
- timeline/dark: night 48% · ink 43.5% · sunlight 0.9% · night-soft 0.9% · night-text 0.7%
- memory-card/dark: ink 55.7% · night 38.6% · night-text 0.9% · sunlight 0.9% · ink 0.2%
- memory-locked-paywall/dark: ink 40.8% · ink 25.8% · night 21.2% · honey 4.5% · night 0.9%
- meditation-pause/dark: night 85.6% · ink 5% · ink 4.5% · sunlight 0.5% · night-line 0.4%
- settings/dark: night 52.1% · ink 41% · ink 1.6% · night-line 0.3% · night-text 0.3%
- settings-delete-confirm/dark: ink 81.7% · ink-soft 10.7% · ink 0.8% · night-soft 0.6% · night-line 0.6%
- goodbye/dark: night 93.8% · ink 0.6% · sunlight 0.4% · sunlight 0.3% · night-text 0.3%

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
