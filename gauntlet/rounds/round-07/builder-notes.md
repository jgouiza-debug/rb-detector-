# Builder notes — round 7 (private to the builder; the council must not read this)

Round 6 was FORCE-FIX: 89, down from 91, regressions on B1 and B4, and red flags
up from 3 to 10. Regressions first, as the rule requires.

## The B1 regression was mine, from round 4

Round 4 changed `StepShell` to `justify-start pt-8` so answers wouldn't slide as
the keyboard opened. That left ~430px of untouched cream between the input and
the "continue" button on three onboarding screens — the question and the button
that answers it reading as two unrelated objects.

It took three attempts to get right, and the first two were worth recording:
`justify-center` still centred the content inside a tall flex area and left the
gap; `justify-end` pushed everything to the floor and made the void appear above,
which read as collapse. The answer was to stop treating the footer as separate
chrome: the question, the input and the action are **one object**, centred
together, so the breathing room falls evenly above and below and the CTA still
lands well inside the thumb zone.

## The two ARIA defects
- `TimelineView`'s mood filter announced `role="tablist"`/`role="tab"` and then
  behaved like plain buttons — no arrow keys, no roving tabindex. It is a filter,
  not a tab set, so it is a `radiogroup` now.
- `BreathingPacer` wrapped a mutating `<h1>` in `aria-live="polite"`, so a screen
  reader narrated the breathing phase continuously on the one screen whose entire
  job is to stop narrating at you. The live region is now a dedicated `sr-only`
  element with `aria-atomic`, announcing the phase once per change.

## Pause screen
`font-reading` (Fraunces) is brand-scoped to the memory surfaces; the pause
screen was borrowing it. Now `font-display`. "i feel ready" demoted from the
loud primary to `soft` — nothing on that screen should shout.

## The keepsake said everything twice
The title is the day's last entry and the reflection is the earlier entries, so
with the raw log printed underneath, one screen showed the user their own
sentences twice. The log is now behind a `<details>` — "what i actually wrote (2)"
— so the keepsake is the keepsake and the source is there when you want it.

Worth being honest about the limit: with the scripted offline adapter the
reflection *is* the entries, tidied. A real LLM synthesis would differ from its
source by construction. The disclosure fixes the screen; it does not make the
fixture generative.

## "just paid? tap here"
I added that in round 3 as reassurance. It was permanently visible, including to
users who have never paid, which reads as "we lose payments sometimes". It now
appears only for subscribers, worded "refresh my plan".

## The photo fixture, and a gate that measured the wrong thing
`tests/e2e/fixtures/photo.jpg` was a flat colour block, so four rounds of reviews
judged a keepsake image layout they could not actually see. It is now a real
generated photograph.

That immediately failed A4: four screens dropped to 83–85% against the palette
proxy's 85% bar, purely because a photograph is many colours. That is the gate
measuring the wrong thing — 70/20/10 is a rule about the palette a designer
chooses, not about the pictures people put in their own journal. `colorCoverage`
now masks `<img>`/`<video>` regions out of the histogram. The change is recorded
in the README with the failure that prompted it, because a measurement loosened
without a stated reason is indistinguishable from gaming the score.

## Known debt
- Radius drift persists (`rounded-xl`, `rounded-3xl` alongside `rounded-card`).
- Timeline navigation still lives only in the top bar.
- The scripted reflection remains a tidy of the source, not a synthesis of it.
