# Gate report — round 14

Generated 2026-09-09T13:49:35.427Z · viewport 390×844 · 38 screen renders (11 dark)

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
| A1.focus | Keyboard focus indicator visible on tabbed controls | 126/126 | PASS |  |
| A1.reducedMotion | Animations still running under prefers-reduced-motion | 0 | PASS |  |
| A2.targets | Interactive targets under 44×44 (block-level) | 0/206 | PASS |  |
| A2.inline | Inline text links under 44px (WCAG 2.5.8 exempt, advisory) | 1 | PASS | settings-about/light: a "get help now" 95.9×20 |
| A2.primary | Primary action present, ≥44px, on screen at landing, in the thumb zone (CTAs) | 38/38 | PASS |  |
| A3.grid8 | Spacing values on the 8pt grid | 93.5% | PASS | off-8 values (count): 4px×270, 12px×10 |
| A3.grid4 | Spacing values off even the 4pt half-grid | 0 | PASS |  |
| A3.void | Empty ground below the last content on a non-scrolling screen (advisory, >200px) | 5/38 screens | PASS | keepsake-reveal/light: 153px; memory-card/light: 47px; memory-locked-paywall/light: 24px; meditation-pause/light: 150px; settings/light: 164px; settings-subscription/light: 124px; help/light: 24px; settings-account/light: 24px; settings-notifications/light: 60px; settings-data/light: 307px; settings-about/light: 128px; goodbye/light: 214px; sign-in/light: 182px; offline/light: 236px; checkout-done/light: 254px; memory-card/dark: 47px; memory-locked-paywall/dark: 24px; meditation-pause/dark: 150px; settings/dark: 164px; goodbye/dark: 214px |
| A3.align | Misaligned sibling blocks (distinct left edges among wide siblings, per screen max) | 0 | PASS |  |
| A4.sizes | Distinct type sizes across the app (≤ 6) | 6: 12, 14, 16, 18, 24, 32px | PASS |  |
| A4.families | Distinct font families (≤ 2) | 2: inter, newsreader | PASS |  |
| A4.weights | Distinct font weights (≤ 3) | 3: 400, 600, 700 | PASS |  |
| A4.palette | 70/20/10 proxy: neutral family ≥ 55% and neutral + two accents ≥ 85% of pixels | 38/38 screens | PASS |  |
| A5.console | Console errors / page errors / failed requests | 0 | PASS |  |
| A5.warnings | Console warnings (advisory) | 0 | PASS |  |
| A5.cls | Cumulative layout shift ≤ 0.1 on every screen | 38/38 | PASS |  |
| A5.fcp | First contentful paint ≤ 1800ms on every screen | 38/38 | PASS |  |
| A5.deadEnds | Dead-end screens (no primary action or < 2 controls) | 0 | PASS |  |
| A5.sticky | Sticky/fixed chrome still on screen after scrolling | 27/27 | PASS |  |
| A5.overflow | Screens that scroll sideways (horizontal overflow) | 0 | PASS |  |

## Per screen

| Screen | Theme | axe (serious+) | contrast fails | targets <44 (block) | primary | 8pt share | void below | CLS | FCP | dominant colour | console |
|---|---|---|---|---|---|---|---|---|---|---|---|
| onboarding-welcome | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 88ms | cream 89.4% (family 89.4%) | 0 |
| onboarding-name | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 36ms | cream 91.5% (family 91.5%) | 0 |
| onboarding-focus | light | 0 | 0 | 0/6 | 342×56 thumb-ok | 100% | scrolls | 0 | 44ms | cream 90.6% (family 90.6%) | 0 |
| onboarding-rhythm | light | 0 | 0 | 0/4 | 342×56 thumb-ok | 100% | scrolls | 0 | 44ms | cream 90.5% (family 90.5%) | 0 |
| onboarding-notify | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 52ms | cream 90.9% (family 90.9%) | 0 |
| thread | light | 0 | 0 | 0/7 | 44×44 thumb-ok | 95.8% | scrolls | 0 | 72ms | cream 82.4% (family 82.4%) | 0 |
| thread-composing-photo | light | 0 | 0 | 0/8 | 44×44 thumb-ok | 95.3% | scrolls | 0 | 52ms | cream 83% (family 83%) | 0 |
| timeline | light | 0 | 0 | 0/13 | 71×44 thumb-ok | 79.9% | scrolls | 0 | 136ms | cream 93.8% (family 93.8%) | 0 |
| keepsake-reveal | light | 0 | 0 | 0/3 | 98×48 thumb-ok | 87.5% | 153px | 0 | 132ms | cream 95% (family 95%) | 0 |
| memory-card | light | 0 | 0 | 0/2 | 44×44 zone n/a | 87.5% | 47px | 0 | 92ms | surface 96.5% (family 96.5%) | 0 |
| memory-locked-paywall | light | 0 | 0 | 0/3 | 310×56 thumb-ok | 90.6% | 24px | 0 | 100ms | surface 90.6% (family 90.6%) | 0 |
| meditation-pause | light | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 150px | 0 | 56ms | cream 96.8% (family 96.8%) | 0 |
| settings | light | 0 | 0 | 0/7 | 358×60 zone n/a | 97.2% | 164px | 0 | 60ms | cream 96.4% (family 96.4%) | 0 |
| settings-subscription | light | 0 | 0 | 0/2 | 358×56 thumb-ok | 83.3% | 124px | 0 | 44ms | cream 90.1% (family 90.1%) | 0 |
| help | light | 0 | 0 | 0/8 | 175×56 thumb-ok | 96.3% | 24px | 0 | 44ms | cream 91.1% (family 91.1%) | 0 |
| thread-crisis | light | 0 | 0 | 0/9 | 158×56 thumb-ok | 97.5% | scrolls | 0.029 | 52ms | pip-bubble 92.1% (family 92.1%) | 0 |
| settings-account | light | 0 | 0 | 0/6 | 86×48 zone n/a | 91.1% | 24px | 0 | 60ms | cream 96.5% (family 96.5%) | 0 |
| settings-notifications | light | 0 | 0 | 0/12 | 72×44 zone n/a | 91.2% | 60px | 0 | 76ms | cream 90.2% (family 90.2%) | 0 |
| settings-data | light | 0 | 0 | 0/3 | 168×48 zone n/a | 84.8% | 307px | 0 | 48ms | cream 94.5% (family 94.5%) | 0 |
| settings-about | light | 0 | 0 | 0/1 | 91×44 zone n/a | 88.9% | 128px | 0 | 48ms | cream 91.1% (family 91.1%) | 0 |
| settings-delete-confirm | light | 0 | 0 | 0/6 | 342×48 thumb-ok | 90.4% | 0px | 0 | 52ms | cream 76.4% (family 76.4%) | 0 |
| goodbye | light | 0 | 0 | 0/2 | 342×48 thumb-ok | 100% | 214px | 0 | 40ms | cream 95.7% (family 95.7%) | 0 |
| sign-in | light | 0 | 0 | 0/3 | 293×56 thumb-ok | 100% | 182px | 0 | 40ms | cream 92.5% (family 92.5%) | 0 |
| offline | light | 0 | 0 | 0/2 | 342×48 thumb-ok | 100% | 236px | 0 | 40ms | cream 91.7% (family 91.7%) | 0 |
| thread-voice | light | 0 | 0 | 0/10 | 342×56 thumb-ok | 95.8% | scrolls | 0 | 56ms | surface 92.5% (family 92.5%) | 0 |
| email-link | light | 0 | 0 | 0/17 | 342×48 thumb-ok | 82% | scrolls | 0 | 120ms | cream 69.4% (family 69.4%) | 0 |
| checkout-done | light | 0 | 0 | 0/1 | 342×48 thumb-ok | 100% | 254px | 0 | 44ms | cream 91.7% (family 91.7%) | 0 |
| onboarding-welcome | dark | 0 | 0 | 0/2 | 342×56 thumb-ok | 100% | scrolls | 0 | 48ms | night 88.7% (family 88.7%) | 0 |
| thread | dark | 0 | 0 | 0/7 | 44×44 thumb-ok | 95.8% | scrolls | 0 | 56ms | night 82.2% (family 82.2%) | 0 |
| thread-composing-photo | dark | 0 | 0 | 0/8 | 44×44 thumb-ok | 95.3% | scrolls | 0 | 48ms | night 82.9% (family 82.9%) | 0 |
| timeline | dark | 0 | 0 | 0/13 | 71×44 thumb-ok | 79.9% | scrolls | 0 | 88ms | night 93.2% (family 93.2%) | 0 |
| memory-card | dark | 0 | 0 | 0/2 | 44×44 zone n/a | 87.5% | 47px | 0 | 100ms | ink 96% (family 96%) | 0 |
| memory-locked-paywall | dark | 0 | 0 | 0/3 | 310×56 thumb-ok | 90.6% | 24px | 0 | 64ms | ink 89.3% (family 89.3%) | 0 |
| meditation-pause | dark | 0 | 0 | 0/3 | 320×56 thumb-ok | 100% | 150px | 0 | 36ms | night 96.1% (family 96.1%) | 0 |
| settings | dark | 0 | 0 | 0/7 | 358×60 zone n/a | 97.2% | 164px | 0 | 56ms | night 95.7% (family 95.7%) | 0 |
| thread-crisis | dark | 0 | 0 | 0/9 | 158×56 thumb-ok | 97.5% | scrolls | 0.029 | 48ms | ink 92.1% (family 92.1%) | 0 |
| settings-delete-confirm | dark | 0 | 0 | 0/6 | 342×48 thumb-ok | 90.4% | 0px | 0 | 36ms | ink 90.7% (family 90.7%) | 0 |
| goodbye | dark | 0 | 0 | 0/2 | 342×48 thumb-ok | 100% | 214px | 0 | 32ms | night 95.2% (family 95.2%) | 0 |

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
- thread/light: cream 59.6% · pip-bubble 17.4% · user-bubble 11% · surface 3.6% · night-text 1%
- thread-composing-photo/light: cream 58.5% · pip-bubble 17.7% · user-bubble 9.3% · surface 5.3% · night-text 1%
- timeline/light: cream 48.3% · surface 43.9% · sunlight 0.8% · heavy-tint 0.8% · ink 0.8%
- keepsake-reveal/light: cream 94% · honey 1.1% · heavy-tint 0.8% · ink 0.6% · sunlight 0.3%
- memory-card/light: surface 56.1% · cream 38.8% · ink 1% · sunlight 0.9% · night-text 0.2%
- memory-locked-paywall/light: surface 58% · cream 30.5% · honey 4.6% · night-text 0.6% · line 0.5%
- meditation-pause/light: cream 86.9% · pip-bubble 5.5% · surface 3.8% · sunlight 0.5% · pip-bubble 0.4%
- settings/light: cream 57.4% · surface 27.6% · night-text 9.2% · pip-bubble 1.4% · line 0.3%
- settings-subscription/light: cream 76% · surface 12.6% · honey 5.4% · pip-bubble 0.8% · ink 0.3%
- help/light: cream 61.6% · surface 27.8% · honey 2.5% · line 0.5% · pip-bubble 0.4%
- thread-crisis/light: pip-bubble 36.1% · cream 29.6% · surface 23.7% · honey 2.8% · line 1.3%
- settings-account/light: cream 77% · surface 12.9% · pip-bubble 5.7% · #F8D898 1.5% · line 0.6%
- settings-notifications/light: cream 60.9% · surface 21.9% · honey 5.1% · pip-bubble 4.6% · ink 1.6%
- settings-data/light: cream 79.3% · surface 14.3% · honey 2% · line 0.3% · pip-bubble 0.2%
- settings-about/light: cream 88.8% · pip-bubble 0.7% · night-text 0.5% · ink 0.4% · #B87858 0.4%
- settings-delete-confirm/light: cream 35.7% · surface 35% · sage 14.3% · night-soft 4.5% · honey 2%
- goodbye/light: cream 90.6% · pip-bubble 4.5% · sunlight 0.4% · ink 0.4% · sunlight 0.3%
- sign-in/light: cream 86.7% · surface 5% · #F8D898 4.5% · pip-bubble 0.4% · sunlight 0.4%
- offline/light: cream 91.2% · honey 4.7% · sunlight 0.4% · pip-bubble 0.4% · sunlight 0.3%
- thread-voice/light: surface 47.2% · cream 18.5% · pip-bubble 16.3% · ink 7% · line 2.3%
- email-link/light: cream 35.2% · surface 33.7% · sage 18.5% · #F8D898 4.6% · heavy-tint 0.8%
- checkout-done/light: cream 90.8% · honey 4.2% · pip-bubble 0.6% · sunlight 0.5% · sunlight 0.3%
- onboarding-welcome/dark: night 86.8% · honey 5.4% · ink 0.9% · sunlight 0.6% · sunlight 0.4%
- thread/dark: night 59.2% · night-bubble-pip 17.7% · user-bubble 11% · ink 3.7% · night-bubble-pip 0.9%
- thread-composing-photo/dark: night 58.2% · night-bubble-pip 17.9% · user-bubble 9.3% · ink 5.5% · night-bubble-pip 0.9%
- timeline/dark: night 47.6% · ink 43.8% · heavy-tint 0.9% · sunlight 0.8% · ink 0.8%
- memory-card/dark: ink 55.9% · night 38.1% · night-text 0.9% · sunlight 0.9% · ink 0.8%
- memory-locked-paywall/dark: ink 57% · night 30.4% · honey 4.5% · ink 0.8% · night-bubble-pip 0.6%
- meditation-pause/dark: night 85.6% · ink 4.8% · ink 4.5% · night-bubble-pip 0.6% · sunlight 0.5%
- settings/dark: night 57% · ink 36.5% · ink 1.6% · night-line 0.3% · night-text 0.3%
- thread-crisis/dark: ink 36.5% · night 28.9% · ink 23.7% · honey 2.7% · night-bubble-pip 1.2%
- settings-delete-confirm/dark: ink 48.8% · night 33.4% · ink-soft 4.6% · night 2.7% · honey 2%
- goodbye/dark: night 89.3% · ink 4.1% · ink 0.7% · night-bubble-pip 0.4% · sunlight 0.4%

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
