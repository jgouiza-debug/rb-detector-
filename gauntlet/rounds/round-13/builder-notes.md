# Round 13 — builder notes

Round 12 held at **median 90** (82 / 89 / 90 / 91 / 96) — a plateau by the
median, but the floor was the ergonomics auditor's 82, and every point it and
the advocate docked was a crisis-flow or dark-mode issue no earlier round reached.
This round clears them. Tier A passes on all five, no caps, 37 renders.

## Safety — the crisis flow, ruled in-scope by two advisors

- **A detected crisis now suppresses the composer AND the bottom nav.** They sat
  directly under "call 988 / text 988", which inverts safety-spec §7 ("escalate
  to humans, not features") — a text box and a "your story" tab are exactly the
  casual features to hide at that moment. `threadStore` gains `crisisActive`, set
  when the crisis card arrives; the thread then shows the resources with one
  quiet "when you're ready, keep writing here" that restores normal mode.
- **EmailLinkSheet could autofocus open over a live crisis conversation** — the
  round-12 `email-link` screenshot showed it over "i want to kill myself".
  `/api/me` now reports `inCareMode` and the sheet refuses to open during the 24h
  care window.
- **The dark crisis card sat at ~1.1:1** against near-black because `--elev-1` is
  a black shadow, invisible there. Every dark elevation level gains a hairline
  light ring (`0 0 0 1px rgba(243,236,221,.08+)`), restoring the depth cue
  (WCAG 1.4.11 non-text).

## My two incomplete fixes, done at the root

- **scroll-clear-chrome** reserved from a hand-typed 8.5rem that under-reserved
  the photo-attached case by ~30px for three rounds. `--composer-h` is 12rem now,
  measured against the ~246px real chrome, over-reserving on purpose (extra space
  below the newest message is harmless; short is not).
- **The clock-source fix only covered the crisis branch.** Every normal reply,
  cap, and fallback bubble still used Postgres `defaultNow()` while the user
  message used `ports.clock` — the same drift, on the 99% path. A monotonic
  stamper seeded at `now` stamps every Pip insert from one clock.

## The single AI-tell (taste critic)

The `text-xs font-bold uppercase tracking-wide` eyebrow — the shadcn/Linear
section-header default — opening the keepsake card and 9 other sites, in a brand
whose whole voice is lowercase. Dropped `uppercase` and the bold-caps weight; the
source text was already lowercase, so "today's keepsake" now speaks in the
product's own register.

## The rest

- `PhotoBubble` gains `Bubble`'s status vocabulary: a failed photo send was
  silent and unrecoverable; it now dims when pending and offers tap-to-retry.
- `SignOutButton` gets a busy state (the only action button without one).
- The account void is anchored (sign-out to the bottom via `mt-auto`).
- The 402 "unlock" string and a fourth redundant "free" promise are gone.
- The dead `--surface-3` token is removed, which also clears the tight
  surface-2↔surface-3 dark pair the systems designer flagged.
- Code inputs `autoFocus` on the stage swap so focus isn't dropped when the
  email stage unmounts.

## Deliberately NOT done — flagged for the council

- **A non-text-contrast (1.4.11) gate check.** The dark-elevation *instance* is
  fixed, but a robust pixel check for card-edge contrast is real work I can't
  validate in one round, and a bad gate check is worse than none — that lesson is
  the whole point of this system. If the council judges it worth building, it's a
  round of its own.

## Known and still open

- The keepsake reveal still fires on every visit to today's memory (needs a
  `viewed` flag — a schema change). The advocate named a once-only full-screen
  reveal as the highest-leverage "I'd keep this" move; it's the biggest remaining
  item and the natural centre of a round.
- The `role="log"` 600ms timer is still a heuristic (not racing in the current
  SSR arch).
- Onboarding CTA ~60px spread across five steps (footer composition).
- 988 is last in reading order for screen-reader users (intentional for thumb
  reach; costs AT users).
