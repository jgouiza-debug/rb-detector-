# Council report — round 02

## State of the UI

Pip now has a real design system underneath it. The type ramp is enforced mechanically —
`app/globals.css:140` sets `--text-*: initial`, wiping Tailwind's size namespace, so an unlisted size
emits no CSS at all — and every spacing utility resolves to {0,4,8,16,24,32,40}px with zero 12px and
zero 20px anywhere in `components/`. All five machine gates pass, no hard cap fires, and the writing
is the best thing in the build: the crisis card ("i'm a small app, not a person who can keep you safe
right now — but there are people who can"), the paywall ("keep it all · $4.99/mo", "cancel anytime ·
export and delete stay free, always"), and the settings groups ("you / how pip reaches you / your
words") could not have come from a template. What the machine cannot see is where it falls down. The
thread's top bar renders but is unreachable, so the app's home screen has no visible door to the
timeline or settings. The payoff artifact — the keepsake the whole product exists to hand back — is
visibly mail-merged: the connective "Later," appears in 7 of 7 reflections on `timeline-light-full`,
and all five compact-card titles are the first four words of their own body repeated verbatim one
line down. And `settings-subscription` is a 520px hole in a cream page with a developer's "refresh
status" button at the bottom of it. The craft is real; three specific surfaces are letting it down.

## Consolidated scorecard

Advisor order: **SD** Systems Designer · **TC** Taste Critic · **IE** Interaction Engineer ·
**EA** Ergonomics & Accessibility Auditor · **UBA** User & Brand Advocate.
Scores are shown **after** each advisor's `revisedScores` from peer review were applied
(SD A1 11→9; IE A1 12→10, A2 8→7, A3 8→6, A4 6→5, B1 7→6, B2 6→5, B5 7→5, C3 6→4, C4 5→4;
EA A1 9→8; UBA A1 12→11, A4 6→5; TC unchanged). `~` marks a voided score (see Void scores).

| # | Pts | SD | TC | IE | EA | UBA | **Median** | Strongest evidence |
|---|---|---|---|---|---|---|---|---|
| A1 | 12 | 9 | 11 | 10 | 8 | 11 | **10** | Gate PASS (0 axe serious+, 0/0 contrast, focus 75/75). Beyond it, three gate-invisible misses I verified: `Skeleton.tsx:4` uses `animate-pulse`, which appears in neither reduced-motion block (`globals.css:274-278` media query, `:279-286` `.motion-reduce-forced`) — both name classes explicitly; `Bubble.tsx:21-37` wraps every message in a `<button>` whose only accessible name is the message text (gate's own interactiveCount: 35 on thread, 46 on thread-crisis); `moodTokens.heavy.bg = palette.line` `#EFE6D3` is identical to the no-entry fallback `var(--line-c)` = `#EFE6D3` in light mode. |
| A2 | 8 | 7 | 8 | 7 | 7 | 8 | **7** | Gate PASS (0/203 under 44×44; primary 21/21 thumb-ok). 44px is structural: `Button` is `h-11/h-12/h-14` and `.tap{min-width:44px;min-height:44px}` (`globals.css:242`) is applied app-wide. Two verified misses: `TopBar.tsx:10` puts the two 44px destination icons at `gap-1` = **4px apart** (timeline vs settings, no confirm, no undo), and `Composer.tsx:80`'s "remove photo" is `size-5` = 20px, untested because no fixture has photos. |
| A3 | 8 | 5 | 7 | 6 | 7 | ~8 | **6.5** | Gate PASS (95.2% on 8pt, all 96 off-8 values are 4px, 0 off the 4pt half-grid, 0 misaligned siblings) and horizontally it is genuinely clean. Vertically it is unauthored: `app/(app)/settings/subscription/page.tsx:29` is `<div className="mt-auto pt-6">`, producing ~520px of empty cream (62% of 844px) between the plan card ending y≈214 and the CTA at y≈735 — the gate recorded 0px void for this screen because A3.void only measures ground *below* the last element. Radius is unenforced where type is enforced: 7 distinct non-pill values, and `settings-light` shows a `rounded-card` 20px help card directly above five `rounded-2xl` 16px rows at identical 358px width. |
| A4 | 6 | 4 | 5 | 5 | ~6 | 5 | **5** | Gate PASS (6 sizes 12/14/16/18/24/32; 3 families fraunces/fredoka/nunito; 3 weights; 70/20/10 on 21/21). Numerically clean, semantically leaky: `BreathingPacer.tsx:75` sets the pause h1 "breathe in…" in `font-reading` Fraunces — verified in `meditation-pause-light.jpg` — though the brand reserves the reading serif for memory surfaces. Colour: the heavy mood carries no colour signal at all (see A1). Icon sizing has nine values (12/13/15/16/18/20/22/26/28) including the same mood glyph at 13px in pills and 15px in dots. |
| A5 | 6 | 6 | 5 | ~6 | ~6 | ~6 | **5.5** | Gate PASS (0 console, CLS ≤0.013, FCP 36–120ms, 0 dead ends, 0 sideways scroll) and the failure paths are real UI, not console noise (optimistic send, "didn't send · tap to retry", offline pill; zero spinners exist app-wide). Against that: **the thread top bar is unreachable** (chair-confirmed, see Tier A cross-check) — `thread-light.jpg`, `thread-dark.jpg` and `thread-crisis-light.jpg` all open on a bubble clipped at y=0 with no chrome above it. |
| B1 | 8 | 6 | 5 | 6 | 7 | 6 | **6** | Right where it counts: `timeline-light` steps 12px "TODAY'S KEEPSAKE" → 24px Fraunces "Monday, September 7" → 18px reflection, and the eye lands on the date. Inverted twice: on `meditation-pause-light` the loudest object is the 342×56 honey "i feel ready" — the *exit* — against a 1px-outline 240px breath ring; `settings-subscription-light` has no focal point at all below y=214; `memory-card-light` breaks its own headline across two lines. |
| B2 | 7 | 5 | 5 | 5 | 6 | 6 | **5** | A real library — `Button/Chip/Pill/Icon/Sheet/Toast/TopBar/BackLink/Skeleton`, with both top bars composed from one `TopBar` primitive — and `moodTokens` genuinely drives dot fill, pill fill, pill text and icon together. Drift underneath: 7 corner radii and 9 icon sizes with no scale; five back-link labels for one gesture ("back to pip", "settings", "your story", "back", "keepsake edition"); two money voices ("keep it all · $4.99/mo" vs "upgrade to Pip+ ($4.99/mo)"); two mood vocabularies ("Heavy" on timeline vs "A mixed day" on memory-card); and `MOOD_FILTERS` (`TimelineView.tsx:14`) ships 5 of the 6 mood tags, so the two "Mixed" days visible on `timeline-light` cannot be filtered for. |
| B3 | 7 | 6 | 6 | 6 | 7 | 6 | **6** | Feedback is real and scaled to the element: `active:scale-[0.98]` on `Button`, `[0.99]` on `CompactCard`, `scale-95` on the 44px composer buttons; optimistic send with `opacity-70` pending and a retry affordance; typing dots staggered 0.16s; skeletons, never spinners (grep for `animate-spin`/`Loader`/`spinner` returns zero hits). Docked: `Bubble.tsx` is the most-tapped element in the app and has **no** `:active` state at all — only the delayed timestamp reveal confirms the tap; the memory-detail skeleton (`h-8 w-40` + `h-40 w-full`) is not the shape of what arrives. |
| B4 | 5 | 4 | 4 | 4 | 5 | ~5 | **4** | Two easing curves for the whole app (`--ease-spring`, `--ease-soft`), and motion is parameterised by context — `BreathingPacer.tsx` sets `--motion-scale: 1.6` inline so every entrance on the pause screen slows 1.6×. The leak: `animate-pulse` is the one `animate-*` class missing from both reduced-motion blocks, so an infinite loop survives for users who asked for less. The onboarding progress bar is `duration-500` (`StepShell.tsx:17`), outside the 150–300ms band every other transition in the app sits in. |
| B5 | 8 | 6 | 5 | 5 | ~7 | 6 | **5.5** | Not a template: the crisis copy, "a whole week, kept.", "what i said, that day", "noted quietly · no reply", a drawn mascot with a sprout and blush cheeks. But the signature artifact is visibly machine-stitched — verified in `timeline-light-full.jpg`: "Later," is the connective in **7 of 7** reflections (`scripted.ts:86`), and all five EARLIER titles are the first four words of their own body repeated on the line below ("Tried the new recipe" / "Tried the new recipe and it actually worked…"). Case drifts inside one card ("i didn't stop once… I'm still here"), and "small win but i'll take it...." shows a period followed by the clamp's ellipsis. |
| C1 | 7 | 5 | 5 | 6 | 6 | 5 | **5** | Progressive disclosure is deliberate and commented: timeline search lives behind one 44px icon with the mood row appearing only after; onboarding is one question per screen; settings is 5 rows in 3 named groups. `meditation-pause-light` breaks it — close X, "i feel ready", "4-4-4-4 Box · switch rhythm" and "pause" are four live decisions (five with the Pip+ 3-minute link) on the one screen whose job is to lower a heart rate, and "4-4-4-4 Box" is jargon mid-breath. |
| C2 | 7 | 6 | 5 | 6 | 7 | 6 | **6** | It reads like a friend: "that sounds heavy." then "you don't have to sort it out right now. what's the part sitting with you most?" (`thread-light`) is reflect-then-ask, and nothing in the app scolds a broken streak. Docked: in `thread-dark.jpg` Pip's bubbles render `--night-bubble-pip: #33302A`, a neutral grey, while the user's stay `#FFCF4D` — the companion goes cold at exactly the hour this app is for; and `PipAvatar` renders the default "listening" face everywhere, so in `thread-crisis-light` the avatar beside "i'm not going anywhere" wears the same expression as the welcome screen despite `expression="concern"` existing in `PipMascot.tsx`. |
| C3 | 6 | 4 | 4 | 4 | 5 | 4 | **4** | Delight is rationed correctly: `animate-keepsake-in` is reserved for a *fresh* memory, "a whole week, kept." fires only when `reflectionCount >= dots.length`, and the locked card shows the day's real date and five line-lengths behind `blur-[3px]` — honest, and it makes you want it. The reveal itself under-delivers: the thing revealed is the "Later," template, no rendered memory-card state contains a photo despite spec §3.3's photo grid, and both source entries on `memory-card-light-full` stamp "10:50 PM" so a whole day looks like one minute. |
| C4 | 5 | 4 | 4 | 4 | 5 | 3 | **4** | Capture is genuinely ≤2 taps (land in thread → type → send; the mic swaps to ArrowUp the moment there is text), onboarding is 5 skippable single-decision screens, and the inline paywall is the best-toned money moment in the build. Two things break the loop: the timeline — the payoff — is reachable only from a top-right icon that, on the thread, is not on screen at all; and the screen a doubting buyer opens, `settings-subscription`, is a plan card, 520px of nothing, "upgrade to Pip+ ($4.99/mo)" and "refresh status". |

**Totals — Tier A 34 / 40 · Tier B 26.5 / 35 · Tier C 19 / 25 · Total 79.5 / 100.**

## Tier A — machine gate vs council cross-check

| Gate | Machine | Council cross-check | Resolution |
|---|---|---|---|
| A1 Accessibility | **PASS** | Three gate-invisible misses verified in source: `animate-pulse` survives both reduced-motion blocks; 35–46 unlabeled `<button>` bubbles per thread screen; heavy-mood dot and no-entry dot share `#EFE6D3` in light mode. | Gate wins — no contrast failure, no cap. Council scores 10/12. |
| A2 Touch | **PASS** | Two real targets the harness could not reach: two 44px destination icons 4px apart (`TopBar.tsx:10` `gap-1`); a 20px "remove photo" button that only exists once a photo is attached. | Gate wins — primary actions are ≥44px and thumb-zone, no cap. Council scores 7/8. |
| A3 Spatial | **PASS** | The void check reads only ground *below* the last element, so it scored `settings-subscription` 0px while ~520px sits in the middle of it. Radius/icon/disc scales are unenforced. | Gate wins. Council scores 6.5/8 and names the blind spot. |
| A4 Type & colour | **PASS** | Type is the strongest system in the build. Role discipline leaks (Fraunces on the pause h1) and the heavy mood carries no colour signal. | Gate wins. Council scores 5/6. |
| A5 Correctness | **PASS** | **The council saw a broken state the machine did not.** `ThreadTopBar` renders but has no sticky travel: `globals.css:215` sets `html, body { height: 100% }`, `app/layout.tsx:65` makes `body` a `min-h-full` flex column, and `Thread.tsx` puts the header as a direct flex item of a `min-h-[100dvh]` column — so the header's containing block ends one viewport down and, at the newest message, the bar sits at `top: -621px`. Chair-confirmed by live measurement; corroborated by all three thread frames opening on a clipped bubble with no chrome. The gate's `deadEnds` probe counts controls, and the thread exposes 35, so it never registered. | **Gate wins the verdict** (no 75 cap this round), but the council scores A5 5.5/6 and this is fix #1. |

**Hard caps: none triggered.** No contrast failure (cap 70), no primary action under 44px or out of the thumb zone (cap 80), no console error, sideways scroll, or machine-detected dead end (cap 75).

## Void scores

Seven scores discarded. Three changed a median; four did not and are recorded for the record.

| Criterion | Advisor | Score | Why voided | Moved the median? |
|---|---|---|---|---|
| A3 | User & Brand Advocate | 8 | The positive case is the gate rows verbatim; the one thing they added — "~520px of empty cream *between* the card and the CTA" — contradicts a full score rather than supporting it. Rests only on the gate passing. | Yes: 7 → **6.5** |
| A4 | Ergonomics Auditor | 6 | Gate rows plus a restatement of the mechanism behind one of them (`--text-*: initial`). No independent evidence for the colour half of A4, which is refuted by the verified `heavy.bg` / `--line-c` collision. | No (5 either way) |
| A5 | Interaction Engineer | 6 | "Nothing in the code contradicts this" — refuted. The defect is in the code they read (`Thread.tsx` + `globals.css:215`), and they state they did not run the app. | Yes, with the two below: 6 → **5.5** |
| A5 | Ergonomics Auditor | 6 | Gate restatement plus "nothing found in the code to contradict this" — refuted by the same confirmed defect. | (see above) |
| A5 | User & Brand Advocate | 6 | A verbatim gate restatement with no independent evidence; their own reading of the missing top bar as "a capture artifact" is refuted by live measurement. | (see above) |
| B4 | User & Brand Advocate | 5 | Rests on "reduced-motion kills all of it (globals.css:274-277)" — refuted: `animate-pulse` is in neither the media-query block nor `.motion-reduce-forced`. | No (4 either way) |
| B5 | Ergonomics Auditor | 7 | "Copy is specific throughout" on the originality criterion — refuted by `timeline-light-full.jpg`, where 7 of 7 reflections share the "Later," seam and five titles duplicate their own first line. | Yes: 6 → **5.5** |

## Red flags — 9 confirmed

Each verified by me against the screenshot or the source this round.

1. **thread (light + dark) & thread-crisis — `ThreadTopBar`:** renders but is unreachable; `top: -621px` at the newest message. The home screen ships with no visible route to the timeline or settings. Mechanism: `globals.css:215` `html, body { height: 100% }` caps the sticky header's containing block at one viewport. *(Verified defect; outside the rubric's seven vibe-coded tells.)*
2. **settings-subscription/light — page balance:** ~520px of empty cream (62% of the 844px viewport) between the plan card ending y≈214 and the CTA at y≈735, from an unauthored `mt-auto pt-6`. *(Rubric tell: wrong balance / floaty spacing.)*
3. **settings-subscription/light — "upgrade to Pip+ ($4.99/mo)" and "refresh status":** a dev-console label promoted to a full-width `Button` in both plan states, in the one product whose whole thesis is voice. *(Rubric tell: generic copy that could belong to any app.)*
4. **timeline (light + dark) — the keepsake copy:** "Later," is the connective in 7 of 7 reflections (`lib/adapters/ai/scripted.ts:86`) and all five EARLIER titles are the first four words of their own body repeated verbatim below (`title: firstWords`, `:83`). *(Rubric tell: template smell / generic copy.)*
5. **memory-card (light + dark) — h1:** 32px Fraunces `formatLongDate(date,{year:true})` in a ~294px column breaks "Sunday, September / 6, 2026", orphaning the year. *(Rubric tell: wrong balance, font too big for its measure.)*
6. **meditation-pause (light + dark) — hierarchy and load:** four live decisions (close X / "i feel ready" / "4-4-4-4 Box · switch rhythm" / "pause") and the honey 342×56 exit button is louder than the 240px breath ring it should be subordinate to. *(Rubric tell: wrong balance.)*
7. **thread & thread-crisis — every chat bubble:** `Bubble.tsx:21-37` is a real `<button>` whose only accessible name is the message text, with nothing describing what activating it does; 35 and 46 of them per screen per the gate's own interactiveCount. *(Verified defect.)*
8. **all loading states — `Skeleton.tsx:4`:** `animate-pulse` is absent from both `@media (prefers-reduced-motion: reduce)` (`globals.css:274-278`) and `.motion-reduce-forced` (`:279-286`), which name classes individually — an infinite animation survives for users who asked for less. Code-confirmed; no captured screen is in a skeleton state, so the gate's probe never met it. *(Verified defect.)*
9. **timeline — WeekFlow heavy dot vs no-entry dot:** `moodTokens.heavy.bg = palette.line` `#EFE6D3` and the `WeekFlow.tsx:29` no-entry fallback `var(--line-c)` resolve to the same `#EFE6D3` on cream `#FFF9ED` (≈1.05:1). A heavy day and a missed day are the same ghost circle, separated only by a 15px glyph. Code-confirmed in light mode; in dark, `--line-c` becomes `#3A352E` so there is no collision. Not visible in this round's renders because all seven days carry entries. *(Verified defect.)*

**Dropped after review — 2:**

- *"timeline EARLIER: five identical CompactCards — repeated section shapes as filler"* (Taste Critic). Refuted with reasoning I accept: a stacked chronological list is the correct form for a timeline, and the two featured cards above break the rhythm. The shape is right; it is the identical *sentences* inside it that read as filler, which is flag 4.
- *"onboarding-welcome: 198px of dead ground below the sign-in link"* (Systems Designer). Verified as measured (the gate reports exactly 198px) but does not clear the bar: it sits below a secondary text link on a deliberately airy first screen, is under the gate's own 200px advisory threshold, and reads as composition. Different in kind from the 520px mid-page hole in flag 2.

## Top 3 fixes for round 03

1. **`thread` — `ThreadTopBar`: make it visible at every scroll position.** One line: change `app/globals.css:215` from `html, body { height: 100% }` to `min-height: 100%` (or give `MessageList` its own `overflow-y: auto` scroll container, or make the bar `fixed`) so the sticky header has travel instead of a containing block that ends at y=844. Target: the bar is pinned at `top: 0` on `thread`, `thread-dark` and `thread-crisis` when scrolled to the newest message. Then move the timeline route out of the top-right corner — spec §2's two-item bottom nav, or a thumb-zone entry — so the payoff is not behind a 44px icon at x≈304, y≈28. *Cheapest work in the round, clears a confirmed broken state and a latent 75-cap risk, and unlocks A5, C1, C4 and part of B2.*
2. **`timeline` / `memory-card` — the keepsake text: kill the mail-merge.** In `lib/adapters/ai/scripted.ts`, delete the fixed `"Later, "` connective at `:86` (vary it by mood and position, or drop it and let the two sentences stand — never in front of an entry that already opens with a conjunction), stop deriving `title` from the first four words at `:83` (take the first clause up to a comma or period, ≤28 chars, or drop compact titles and let the date carry the row), settle on one case convention, and rotate the closing line so two heavy days on one screen do not both end "That counts." Target: no two of the seven cards on `timeline-light-full` share a connective or repeat their own first line. *B5 is the largest single gap on the board at 2.5 points, and this also moves C3, C2 and C4 — one file.*
3. **`settings-subscription` — fill the void and give it Pip's voice.** Replace the `mt-auto pt-6` at `app/(app)/settings/subscription/page.tsx:29` with real content: the five Pip+ benefits from spec §3.7 set small in `text-fg-soft` under the plan card, plus renewal and cancellation stated plainly. Delete `SubscriptionActions`' "refresh status" from the user-facing UI (refetch on focus instead), lowercase "pip+" to match the paywall, and set the price as "keep it all · $4.99/mo" so the product has one money voice. Target: ≤ 96px of unfilled vertical run anywhere on the screen, and a focal point below y=214. *Clears two of the nine red flags at once and moves B1, B2, C1 and C4.*

## Regression check

Compared against `gauntlet/rounds/round-01/council-rejudge/council-report.md` (medians A1 11, A2 7,
A3 7, A4 5, A5 5.5, B1 5, B2 5, B3 5, B4 4, B5 5, C1 5, C2 5, C3 3.5, C4 4 — total 77).

**Medians that dropped — 2:**

- **A1: 11 → 10 (−1).** Driven entirely by findings, not by a proven change in the code: three
  gate-invisible misses (`animate-pulse` under reduced motion, the unlabeled bubble-buttons, the
  heavy/no-entry colour collision) were surfaced and verified this round that no advisor raised last
  round. The gate verdict is unchanged (PASS, 0 axe, 0 contrast, focus 75/75). I cannot confirm from
  the inputs available to me whether the underlying code differed in round 01, so this is recorded as
  a median drop rather than asserted as a UI regression.
- **A3: 7 → 6.5 (−0.5).** Same character: the `settings-subscription` mid-page void and the
  radius/disc drift on `settings-light` are newly measured, and the gate's spatial numbers improved
  or held (95.2% on 8pt, 0 off the half-grid, 0 misaligned siblings).

**Everything else held or improved:** A2 7=7, A4 5=5, A5 5.5=5.5, B1 5→6, B2 5=5, B3 5→6, B4 4=4,
B5 5→5.5, C1 5=5, C2 5→6, C3 3.5→4, C4 4=4. Round total 77 → **79.5** (+2.5). No criterion that
passed a gate last round fails one now, so the rubric's zero-improvement regression clause does not
fire.

## Jury note

Models: Opus (Systems Designer), Fable (Taste Critic), Sonnet (Interaction Engineer), Sonnet
(Ergonomics Auditor), Opus (User & Brand Advocate). Confidence: **low**. Two of the five opened at or
near the ceiling on Tier A by restating the gate — one submitted a 93 and then revised nine criteria
downward on peer review, which is the correct outcome but also the diagnosis. More seriously, the
round's single most consequential defect (the unreachable thread top bar) was missed by three
advisors, correctly raised but hedged by one, and then confidently *refuted* by two independent peer
reviewers who reasoned that a chat scrolled to its newest message would naturally show no header —
plausible, wrong, and settled only by a live measurement outside the council. A jury that
manufactures consensus against a real bug should not have its ceiling trusted, even though its
medians here are mid-range and every surviving score carries file:line or screenshot evidence.
