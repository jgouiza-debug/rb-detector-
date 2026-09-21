# Round 12 — builder notes

Round 11 scored **median 90** (90 / 88 / 90 / 89 / 93). The systems designer who
caught round 10's gate-gaming verified all four gate corrections as genuine, not
gamed. This round clears the findings the five advisors converged on. Tier A
passes on all five, no caps, 37 renders (dark thread-crisis added).

## The cadence, ruled and acted on — not flattened

Round 10 I removed a templated coda from the keepsake and the taste critic found
the reassurance instinct had relocated into hand-written "[fact] — [comfort]"
em-dash strings. I deliberately did NOT touch them last round and asked for a
ruling. Both the taste critic (who owns B5 and raised it) and the user advocate
ruled it: **Pip's actual voice, not a slop tell — three rhythmic gears, not a
pool.** The critic named exactly two decorative strings to break and said stop:
- `settings/data` "…any time — free." (the one line stacking both tells)
- `PaywallCard` "stay free, always" → "are always free"

Broke those two. Left every other em-dash string, both crisis lines included.
This is the point of asking before flattening: reflexively varying all ~16 would
have damaged the register the product is built on.

## Accessibility (ergonomics auditor, sharpest advisor three rounds running)

- **All three `<dialog>` screens mis-focused on open.** `Sheet` rendered the
  close X first in the DOM, so `showModal()`'s autofocus landed on it instead of
  the email field / delete-confirm input / voice action. The X is positioned and
  rendered last now, so focus falls on the sheet's real first control. One fix,
  all three dialogs.
- **sign-in's `role="alert"` went silent on a repeat.** Enter the wrong code
  twice and an AT user heard nothing the second time, because the alert text
  didn't change. It's keyed on a per-failure counter now.

## Correctness (interaction engineer)

- **The scroll-padding was still short.** `.scroll-clear-chrome` hard-coded 5rem
  and dropped the safe-area term `.pb-chrome` includes, so it undershot even the
  minimal chrome and missed the photo-queued state by ~100px. It now derives from
  the same nav + safe-area terms plus `--composer-h` for the tall case.
- **A clock-source mismatch in the crisis fix.** The bubbles ordered from
  `ports.clock.now()` but the user's own triggering message used Postgres
  `defaultNow()` — on a two-host deployment the DB clock could sort the user's
  message after Pip's reply. The user message stamps from the same clock now, and
  bubbles sit strictly after it (+1+i ms). My round-11 fix made the bubbles
  consistent with each other but not with the message they answer.

## Systemization

- `SignOutButton` hand-rolled a sixth button look and was duplicated (hub + the
  account page I added it to this round). It's a `Button` variant now and lives
  only on the account page, per spec 3.6.

## Fixture

- `thread-crisis` was never captured in dark — the app's highest-stakes screen,
  contrast unverified. Added to `DARK_SCREENS`; it renders clean (0 axe, 0
  contrast fails) in both themes.

## Known and not fixed — for the council

- **The crisis thread keeps the bottom nav** while `/help` correctly drops it.
  The user advocate wants detected crises routed into a nav-less takeover so a
  person in distress isn't invited to wander into a feature. This is a routing
  change, not a tweak — flagging for a decision on whether it's in scope.
- **`isToday` keepsake reveal fires on every visit to today's memory**, not first
  view. Needs a `viewed` flag on the row (a schema change). Bounded to one day,
  but still not a reveal.
- **The `role="log"` 600ms timer** is a heuristic, not a real "history settled"
  signal. Not racing in the current SSR architecture (history arrives with the
  first render) but it would break under client-fetched history.
- **Settings voids**: account ~347px, data ~307px of trailing ground.
- **night-bubble-pip and night-line are within each other's match tolerance** in
  the gate's crowded dark palette — deterministic today, a latent hazard the
  systems designer flagged.
- **Onboarding CTA ~60px spread** across five steps: four footer compositions,
  not content height.
