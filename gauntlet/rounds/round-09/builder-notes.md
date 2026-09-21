# Round 9 — builder notes

The round the fixture stopped lying.

## What changed about the measurement

Preflight (`gauntlet/scripts/preflight.ts`) landed and immediately failed four
of six checks against this repo. The headline: **the gate had been rendering 15
of 24 routes and none of the three modal states.** Every Tier A pass from round
0 to round 8 was measured over roughly 62% of the app, and every score reported
off those gates inherited that.

The fixture now covers every route and every dialog, with `/dev/*` and `/`
exempted in `gauntlet/config.ts` with written reasons. Modal coverage is
declared per screen (`opens: ["DangerZone"]`) rather than inferred, because a
setup that clicks by role never names the component it opens.

## What the newly-visible half was hiding

- `/goodbye`: zero interactive elements, reachable from delete-account. A
  dead-end state, which caps the total at 75. It had been there since before
  round 0, through nine rounds of a council explicitly hunting dead ends.
- `settings-delete-confirm` in dark: "delete account" at **2.97:1**.
  `--blush-ink` had no dark half at all.
- `settings-account`: the name field's `<label>` was never associated with its
  input. Serious axe violation.
- `/offline` and `/checkout/done`: each had a single 24px underlined text link
  as the screen's only action. `/checkout/done` also pointed a signed-out
  visitor at `/timeline`, which bounces them to `/welcome` — someone who paid on
  a laptop had no route to what they bought.
- A third font family (`font-mono`) inside the delete dialog, past nine type
  gates, because `--text-*` was sealed and `--font-*` never was.

## Gate corrections (both defensible, both flagged for the council)

1. **Modal scrims are masked out of the colour histogram.** Every screen with a
   sheet open failed 70/20/10 for having a sheet open: the second and third
   colours were `#A8A898`/`#A8A888`, which are `ink/40` composited over cream.
   That is not a palette choice, it is the page already counted, uniformly
   darkened. Masked on the same reasoning the file already masks user photos
   (added round 7, for the same class of false failure).
2. **Screens can declare `teardown`.** The email-link fixture's route override
   outlived its own capture and blocked every screen after it.

Neither is a threshold widening. Both make the measurement more correct. Say so
if you disagree — the rule is that the builder never loosens a gate, and I would
rather be told I broke it than not.

## Product changes

- **A two-item bottom nav** (`components/nav/BottomNav.tsx`). `03-design-spec.md:33`
  has mandated Thread + Timeline since the start and the build never had one; the
  timeline was reachable only from an unlabelled top-corner icon at y≈52. The
  composer and the nav are one sticky group so there is a single bottom chrome.
- **Press states everywhere.** 4 files → 13. Hover alone is no feedback on a phone.
- **The radius ladder is sealed and honest.** Six radii were rendering against a
  three-rung ladder; `--radius-*: initial` plus five named rungs, every call site
  on one.
- **The disclosure got a chevron.** "what i actually wrote" looked like a heading.
- **The onboarding CTA stopped drifting 68px** across five steps: content centres
  in the space above the action, the action anchors.
- **Keepsakes end on your own words.** Only a single-line day borrows a closing,
  and the aphorisms are gone. `moodLabel` is lowercase in both the fixture and
  the production prompt.
- Locked days get their real count; Pip's gradient ids are per-instance; the
  voice sheet stopped announcing every interim recognition tick; the subscription
  list got a heading, lost ~180px of dead ground, and stopped showing filled
  checkmarks for features you have not bought.

## Known and not fixed

- The rhythm toggle changed size (28→32px track) to get off a 2px inset. Check it
  still reads as the same switch.
- `resonated` is stored and nothing downstream reads it. The heart still has no
  consequence.
- The keepsake reveal is still a list item, not a staged arrival.
