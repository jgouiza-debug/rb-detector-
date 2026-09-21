# Builder notes — round 6 (private to the builder; the council must not read this)

Round 5 scored 91 and cleared the round-4 regressions, but its chair marked the
jury low-confidence (one peer review never ran) and named three fixes. All three
were defects the peer round found in code I had written *that round* while
claiming to fix exactly those areas.

## The safe-area fix that wasn't

Round 5 moved the utilities into `@layer utilities` and wrote
`.pt-safe { padding-top: max(env(safe-area-inset-top), var(--pt-safe-min, 0px)) }`
— against variables that were never declared. So the `max()` collapsed to `0px`
and, sitting later in the same layer, still erased `py-6`/`py-8` on nine screens.
Measured live before: `/help`'s `<main>` computed `padding-top: 0px` against a
`py-6` that intends 24px. `--pt-safe-min` / `--pb-safe-min: 1.5rem` are now
declared on `:root`; measured after: 24px / 24px. The advisory `A3.void` numbers
fell across the board once pages actually had their padding.

Two rounds running, my fix was half a fix and the jury caught it. Worth saying
plainly rather than burying: the council is not polishing this build, it is
finding things that were broken the whole time.

## A journal is not a list of buttons

`Bubble.tsx` rendered every message as a real `<button>` so that tapping revealed
a timestamp — a hidden interaction nobody discovers, at the cost of a screen
reader announcing a personal journal as thirty-four buttons. The bubble is a
`<div>` now. `decorate()` already computes `showTime` at natural conversation
gaps, so the timestamp surfaces on its own where it means something.

## "Skip to content" that skipped nothing

`id="main"` sat on the `(app)` layout wrapper, which *contains* the top bar, so
the skip link landed above the chrome it was meant to skip. The id moved onto
each route's own `<main>` — thread, timeline, memory, pause, and all six settings
screens.

## The keepsake title

`day.title` had been computed since round 4 and rendered on the compact cards
only — the two surfaces the product actually sells never showed it. Rendering it
exposed a second defect immediately: `sentence(last, 46)` truncated mid-clause
("Turns out the team was cheering for me the"), and two titles opened on "But".
A title is now the day in the writer's own words *or nothing*: leading
conjunctions are stripped, and a source that doesn't fit in 56 characters yields
no title rather than a fragment, leaving the date to carry the card.

Verified on the re-rendered week — seven titles, seven distinct, all complete:
"I made it through, and I'm home now" · "Turns out the team was cheering for me
the whole time" · "Three days of fog just lifted" · "Felt genuinely peaceful for
once" · "We're getting dinner next week" · "Small win but I'll take it" · "I got
through it, and that counts".

Also: `echoes()` widened to four-letter words, and a bare lowercase "i" is now
capitalised.

## Known debt
- Radius drift persists in a few components (`rounded-xl`, `rounded-3xl`).
- Timeline navigation still lives only in the top bar, not the thumb zone.
- The subscription screen still shows two CTAs to a free user.
- The fixture photo is a flat colour block, so the keepsake's image layout is
  only structurally exercised, not visually judged.
