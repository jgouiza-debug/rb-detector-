# Gate report — round 00

Generated 2026-09-07T02:21:29.124Z · viewport 390×844 · 21 screen renders (7 dark)

## Tier A summary

| Gate | Result |
|---|---|
| A1 Accessibility | FAIL |
| A2 Touch & ergonomics | FAIL |
| A3 Spatial system | FAIL |
| A4 Type & colour systems | FAIL |
| A5 Correctness & performance | FAIL |

Hard caps triggered: contrast→70: **no** · primary target→80: **YES** · broken state→75: **YES**

## Checks

| # | Check | Value | Pass | Detail |
|---|---|---|---|---|
| A1.axe | axe-core WCAG 2.x A/AA serious+critical violations | 2 | FAIL | thread/light: target-size; thread/dark: target-size |
| A1.contrast | Rendered text contrast failures (axe + measured) | 0 axe / 0 measured | PASS |  |
| A1.focus | Keyboard focus indicator visible on tabbed controls | 76/76 | PASS |  |
| A1.reducedMotion | Animations still running under prefers-reduced-motion | 0 | PASS |  |
| A2.targets | Interactive targets under 44×44 (block-level) | 67/210 | FAIL | onboarding-welcome/light: a "already have pip? sign in" 342×20; onboarding-rhythm/light: input[aria-label="morning check-in time"] 117.9×28; onboarding-rhythm/light: input[aria-label="evening check-in time"] 117.9×28; thread/light: button "hey sam. i'm really glad you're " 271×40.6; thread/light: button "so — how are you, right now?" 232×40.6; thread/light: button "i hear you, sam." 135×40.6; thread/light: button "tell me a little more?" 168×40.6; thread/light: button "the light was really nice this m" 280×40.6; thread/light: button "no agenda, just rest" 164×40.6; thread/light: button "long call with mom, laughed a lo" 256×40.6; thread/light: button "i should do that more often" 213×40.6; thread/light: button "watching it grow feels good" 220×40.6 |
| A2.inline | Inline text links under 44px (WCAG 2.5.8 exempt, advisory) | 3 | PASS | thread/light: a "get help now" 85×19; thread-crisis/light: a "get help now" 85×19; thread/dark: a "get help now" 85×19 |
| A2.primary | Primary action present, ≥44px, on screen at landing, in the thumb zone (CTAs) | 14/21 | FAIL | timeline/light: 95×20; timeline/dark: 95×20; timeline/light: off-screen at landing (y=640); thread-crisis/light: off-screen at landing (y=-64); timeline/dark: off-screen at landing (y=640); memory-locked-paywall/light: centre y=294 above thumb zone; settings-subscription/light: centre y=224 above thumb zone; help/light: centre y=274 above thumb zone; memory-locked-paywall/dark: centre y=294 above thumb zone |
| A3.grid8 | Spacing values on the 8pt grid | 48.5% | FAIL | off-8 values (count): 12px×336, 6px×336, 10px×218, 4px×101, 20px×52, 28px×16, 1px×8, 2px×6 |
| A3.grid4 | Spacing values off even the 4pt half-grid | 568 | FAIL |  |
| A3.align | Distinct left edges of wide blocks per screen (max) | 9 | FAIL | thread/light: 12,30,48,85,98,110,122,135; thread-crisis/light: 12,27,30,48,85,98,110,122,135; thread/dark: 12,30,48,85,98,110,122,135 |
| A4.sizes | Distinct type sizes across the app (≤ 6) | 10: 11, 12, 14, 15, 16, 17, 18, 24, 30, 36px | FAIL |  |
| A4.families | Distinct font families (≤ 3, brand three-role system) | 3: fraunces, fredoka, nunito | PASS |  |
| A4.weights | Distinct font weights (≤ 3) | 3: 400, 600, 700 | PASS |  |
| A4.palette | 70/20/10 proxy: dominant colour ≥ 55% and top-3 ≥ 85% of pixels | 15/21 screens | FAIL | memory-card/light: dominant 51.9%; settings/light: dominant 50.4%; thread/dark: dominant 53.9%; memory-card/dark: dominant 51.7%; meditation-pause/dark: dominant 39.2%; settings/dark: dominant 50.2% |
| A5.console | Console errors / page errors / failed requests | 3 | FAIL | memory-locked-paywall/light: [console.error] Failed to load resource: the server responded with a status of 402 (Payment Required); meditation-pause/light: [console.error] Blocked call to navigator.vibrate because user hasn't tapped on the frame or any embedded frame yet: https://www.chromes; memory-locked-paywall/dark: [console.error] Failed to load resource: the server responded with a status of 402 (Payment Required) |
| A5.warnings | Console warnings (advisory) | 0 | PASS |  |
| A5.cls | Cumulative layout shift ≤ 0.1 on every screen | 21/21 | PASS |  |
| A5.fcp | First contentful paint ≤ 1800ms on every screen | 21/21 | PASS |  |
| A5.deadEnds | Dead-end screens (no primary action or < 2 controls) | 0 | PASS |  |
| A5.overflow | Screens that scroll sideways (horizontal overflow) | 2 | FAIL | timeline/light: +254px (main "Your Storyquiet reflections quie" 644px wide); timeline/dark: +254px (main "Your Storyquiet reflections quie" 644px wide) |

## Per screen

| Screen | Theme | axe (serious+) | contrast fails | targets <44 (block) | primary | 8pt share | CLS | FCP | dominant colour | console |
|---|---|---|---|---|---|---|---|---|---|---|
| onboarding-welcome | light | 0 | 0 | 1/2 | 342×56 thumb-ok | 83.3% | 0 | 44ms | cream 88.8% | 0 |
| onboarding-name | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 87.5% | 0 | 40ms | cream 84.7% | 0 |
| onboarding-focus | light | 0 | 0 | 0/6 | 342×56 thumb-ok | 71.4% | 0 | 36ms | cream 83.8% | 0 |
| onboarding-rhythm | light | 0 | 0 | 2/4 | 342×56 thumb-ok | 61.5% | 0 | 40ms | cream 79.5% | 0 |
| onboarding-notify | light | 0 | 0 | 0/2 | 342×56 thumb-ok | 75% | 0 | 32ms | cream 90.3% | 0 |
| thread | light | 1 | 0 | 16/34 | 44×44 thumb-ok | 47% | 0 | 52ms | cream 55.8% | 0 |
| timeline | light | 0 | 0 | 3/17 | 95×20 OFF-SCREEN | 38.2% | 0 | 84ms | surface 64.1% | 0 |
| memory-card | light | 0 | 0 | 1/4 | 150×44 zone n/a | 57.1% | 0.077 | 80ms | cream 51.9% | 0 |
| memory-locked-paywall | light | 0 | 0 | 1/2 | 302×56 OUT OF ZONE | 57.9% | 0.062 | 56ms | cream 63.2% | 1 |
| meditation-pause | light | 0 | 0 | 0/3 | 320×56 thumb-ok | 60% | 0 | 52ms | surface 75.4% | 1 |
| settings | light | 0 | 0 | 1/8 | 350×68 zone n/a | 51.6% | 0 | 52ms | cream 50.4% | 0 |
| settings-subscription | light | 0 | 0 | 1/3 | 278×56 OUT OF ZONE | 52.4% | 0 | 40ms | cream 86.9% | 0 |
| help | light | 0 | 0 | 1/8 | 69×44 OUT OF ZONE | 61.5% | 0 | 36ms | surface 61.5% | 0 |
| thread-crisis | light | 0 | 0 | 17/45 | 69×44 OFF-SCREEN | 46.3% | 0.009 | 40ms | pip-bubble 55.4% | 0 |
| onboarding-welcome | dark | 0 | 0 | 1/2 | 342×56 thumb-ok | 83.3% | 0 | 44ms | night 87.2% | 0 |
| thread | dark | 1 | 0 | 16/34 | 44×44 thumb-ok | 47% | 0 | 44ms | night 53.9% | 0 |
| timeline | dark | 0 | 0 | 3/17 | 95×20 OFF-SCREEN | 38.2% | 0 | 100ms | ink 63.5% | 0 |
| memory-card | dark | 0 | 0 | 1/4 | 150×44 zone n/a | 57.1% | 0.077 | 80ms | night 51.7% | 0 |
| memory-locked-paywall | dark | 0 | 0 | 1/2 | 302×56 OUT OF ZONE | 57.9% | 0.063 | 56ms | night 62.7% | 1 |
| meditation-pause | dark | 0 | 0 | 0/3 | 320×56 thumb-ok | 60% | 0 | 40ms | ink 39.2% | 0 |
| settings | dark | 0 | 0 | 1/8 | 350×68 zone n/a | 51.6% | 0 | 44ms | night 50.2% | 0 |

## Type system observed

- Sizes (10): 11, 12, 14, 15, 16, 17, 18, 24, 30, 36px
- Families (3): fraunces, fredoka, nunito
- Weights (3): 400, 600, 700

## Colour coverage (pixel share of the viewport, top 5)

- onboarding-welcome/light: cream 88.8% · honey 5.5% · pip-bubble 0.7% · sunlight 0.6% · sunlight 0.4%
- onboarding-name/light: cream 84.7% · surface 6% · honey 5.6% · amber-ink 0.7% · ink 0.3%
- onboarding-focus/light: cream 83.8% · surface 5.7% · honey 5.7% · ink 0.4% · night-text 0.4%
- onboarding-rhythm/light: cream 79.5% · surface 9.9% · honey 5.7% · line 0.4% · ink 0.3%
- onboarding-notify/light: cream 90.3% · honey 5.6% · pip-bubble 0.4% · ink 0.3% · sunlight 0.3%
- thread/light: cream 55.8% · user-bubble 34.8% · surface 3.3% · line 0.7% · honey 0.5%
- timeline/light: surface 64.1% · cream 27.2% · ink 2.3% · line 0.3% · night-text 0.3%
- memory-card/light: cream 51.9% · surface 40.5% · ink 2.1% · pip-bubble 0.7% · night-bubble-pip 0.2%
- memory-locked-paywall/light: cream 63.2% · surface 28.7% · ink 4.4% · night-text 0.5% · line 0.5%
- meditation-pause/light: surface 75.4% · cream 15.4% · honey 5% · sunlight 0.5% · pip-bubble 0.3%
- settings/light: cream 50.4% · surface 36.4% · night-text 8.2% · pip-bubble 1.4% · line 0.3%
- settings-subscription/light: cream 86.9% · surface 7.4% · honey 3.9% · ink 0.3% · night-text 0.1%
- help/light: surface 61.5% · cream 31.8% · honey 1.4% · ink 0.3% · pip-bubble 0.2%
- thread-crisis/light: pip-bubble 55.4% · surface 21.8% · cream 16.3% · honey 1.8% · line 0.8%
- onboarding-welcome/dark: night 87.2% · honey 5.5% · ink 0.8% · sunlight 0.6% · night-line 0.4%
- thread/dark: night 53.9% · user-bubble 34.8% · ink 4.5% · night-line 0.8% · night 0.6%
- timeline/dark: ink 63.5% · night 27% · ink 1.6% · night-text 1% · line 0.4%
- memory-card/dark: night 51.7% · ink 40% · ink 1.8% · pip-bubble 0.6% · night-text 0.5%
- memory-locked-paywall/dark: night 62.7% · ink 28.6% · ink 4.5% · night-line 0.6% · night-line 0.4%
- meditation-pause/dark: ink 39.2% · night 25.7% · night 24.3% · honey 5% · night-line 0.5%
- settings/dark: night 50.2% · ink 36.2% · #584838 8.2% · ink 1.5% · #A87878 0.3%

## axe violations (all impacts, WCAG + best-practice)

- thread/light: **landmark-one-main** (moderate, 1 node) — Document should have one main landmark · e.g. `<html lang="en" class="fredoka_70521e3f-module__5tzZRa__variable nunito_bbe0d9e1-module__TLmraa__var`
- thread/light: **page-has-heading-one** (moderate, 1 node) — Page should contain a level-one heading · e.g. `<html lang="en" class="fredoka_70521e3f-module__5tzZRa__variable nunito_bbe0d9e1-module__TLmraa__var`
- thread/light: **region** (moderate, 1 node) — All page content should be contained by landmarks · e.g. `<textarea rows="1" placeholder="tell pip anything…" aria-label="message pip" class="max-h-36 flex-1 `
- thread/light: **target-size** (serious, 1 node) — All touch targets must be 24px large, or leave sufficient space · e.g. `<button type="button" class="animate-bubble-in whitespace-pre-wrap break-words px-4 py-2.5 text-left`
- timeline/light: **heading-order** (moderate, 1 node) — Heading levels should only increase by one · e.g. `<h3 class="font-reading text-2xl leading-tight text-fg">Monday, September 7</h3>`
- memory-locked-paywall/light: **page-has-heading-one** (moderate, 1 node) — Page should contain a level-one heading · e.g. `<html lang="en" class="fredoka_70521e3f-module__5tzZRa__variable nunito_bbe0d9e1-module__TLmraa__var`
- thread-crisis/light: **landmark-one-main** (moderate, 1 node) — Document should have one main landmark · e.g. `<html lang="en" class="fredoka_70521e3f-module__5tzZRa__variable nunito_bbe0d9e1-module__TLmraa__var`
- thread-crisis/light: **page-has-heading-one** (moderate, 1 node) — Page should contain a level-one heading · e.g. `<html lang="en" class="fredoka_70521e3f-module__5tzZRa__variable nunito_bbe0d9e1-module__TLmraa__var`
- thread-crisis/light: **region** (moderate, 1 node) — All page content should be contained by landmarks · e.g. `<textarea rows="1" placeholder="tell pip anything…" aria-label="message pip" class="max-h-36 flex-1 `
- thread/dark: **landmark-one-main** (moderate, 1 node) — Document should have one main landmark · e.g. `<html lang="en" class="fredoka_70521e3f-module__5tzZRa__variable nunito_bbe0d9e1-module__TLmraa__var`
- thread/dark: **page-has-heading-one** (moderate, 1 node) — Page should contain a level-one heading · e.g. `<html lang="en" class="fredoka_70521e3f-module__5tzZRa__variable nunito_bbe0d9e1-module__TLmraa__var`
- thread/dark: **region** (moderate, 1 node) — All page content should be contained by landmarks · e.g. `<textarea rows="1" placeholder="tell pip anything…" aria-label="message pip" class="max-h-36 flex-1 `
- thread/dark: **target-size** (serious, 1 node) — All touch targets must be 24px large, or leave sufficient space · e.g. `<button type="button" class="animate-bubble-in whitespace-pre-wrap break-words px-4 py-2.5 text-left`
- timeline/dark: **heading-order** (moderate, 1 node) — Heading levels should only increase by one · e.g. `<h3 class="font-reading text-2xl leading-tight text-fg">Monday, September 7</h3>`
- memory-locked-paywall/dark: **page-has-heading-one** (moderate, 1 node) — Page should contain a level-one heading · e.g. `<html lang="en" class="fredoka_70521e3f-module__5tzZRa__variable nunito_bbe0d9e1-module__TLmraa__var`

## Console / network events

- memory-locked-paywall/light: [http, expected] 402 GET /api/memory/2026-08-29
- memory-locked-paywall/light: [console.error] Failed to load resource: the server responded with a status of 402 (Payment Required)
- meditation-pause/light: [console.error] Blocked call to navigator.vibrate because user hasn't tapped on the frame or any embedded frame yet: https://www.chromestatus.com/feature/5644273861001216.
- memory-locked-paywall/dark: [http, expected] 402 GET /api/memory/2026-08-29
- memory-locked-paywall/dark: [console.error] Failed to load resource: the server responded with a status of 402 (Payment Required)

## Reduced motion

- onboarding-welcome: 0 running animations
- onboarding-name: 0 running animations
- onboarding-focus: 0 running animations
- onboarding-rhythm: 0 running animations
- onboarding-notify: 0 running animations
- thread: 0 running animations
- timeline: 0 running animations
- meditation-pause: 0 running animations
