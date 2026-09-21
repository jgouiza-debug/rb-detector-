# Taste Brief — what "premium warm companion" looks like right now

Written by the Researcher role at round 0. Refresh every 4 rounds. Every agent in the loop reads this; the council may cite it as a standard, never as a score.

## The bar, in one line

The best companion apps feel like one calm object with one voice, not a dashboard of features. Warmth comes from restraint, timing and copy, not from more color.

## Patterns worth stealing (and why they fit Pip)

**Finch (self-care pet).** The mascot is *present* on the home screen at all times, reacts to what you do, and the whole UI is built around a single daily loop (check in → pet responds → small reward). Lesson for Pip: Pip should be alive in the thread header and empty states with idle breathing, and react (expression change) when the user sends something heavy or happy. Finch's failure mode: too many currencies and badges. Pip must never add a second economy.

**Duolingo.** Huge, confident buttons anchored at the bottom (thumb zone), one decision per screen, immediate feedback on every tap, and a character whose expressions carry the emotional beat. Also: the streak. Pip's brand explicitly rejects shame-streaks, so borrow the *anchored primary action* and *expressive character*, not the guilt mechanics.

**Stoic.** A journaling app that treats type as the interface: generous serif reading sizes, warm off-white, almost no chrome. Entries feel like pages, not rows. Lesson: the timeline and memory card should lean harder into the Fraunces reading voice and quiet everything else around it. One screen, one texture.

**How We Feel.** Emotion selection as a calm color field, not a clinical chart. Mood is conveyed by hue families and soft shapes, never red-alert. Lesson: the WeekFlow dots and mood pills are on the right track; the risk is turning them into a status bar. Keep mood as color + one soft icon, never a metric.

## Current best-practice notes (2026)

1. **Anchored primary actions.** Mobile-first apps keep the primary CTA sticky at the bottom with safe-area padding. If the CTA is above the fold on a phone, it is in the wrong place.
2. **Tap targets are 44–48px minimum, everywhere.** Including chat bubbles if they are tappable, including inline "learn more" links (make them blocks or drop the affordance).
3. **8pt grid with 4pt micro-steps only inside components.** Layout spacing (between blocks, page margins) lives on 8/16/24/32/48. 12px and 20px paddings are the tell of a Tailwind default left standing.
4. **Type ramp of six.** A display size, a heading, a reading size, a body, a caption, a micro-label. Anything beyond that is a decision nobody made.
5. **Skeletons that match the shape of what's coming**, 150–300ms transitions, `prefers-reduced-motion` respected without the UI feeling dead (opacity fades still allowed).
6. **Copy is the brand.** Lowercase, first-person, short. No "unlock", no "powerful", no "journey". Paywalls read like a friend explaining what more you'd get, with the price plainly stated and an easy exit.
7. **Dark mode is a second design, not an inversion.** Check that yellows glow rather than shout on near-black, that surfaces have a visible but soft step from the background, and that the same hierarchy holds.
8. **One focal point per screen.** If a screen has a heading, a card title and a big date all fighting at 24–36px, nobody wins.

## Pip-specific guardrails from the brand book

- Yellow is for surfaces, accents, Pip and highlights. Never for reading text on cream.
- Three type roles only: Fredoka (display), Nunito Sans (UI), Fraunces (reading). Reading serif is reserved for the memory surfaces so the shift means something.
- Soft `sunlight → honey` glow behind Pip is the only permitted gradient.
- Motion lowers heart rate: fade + rise for messages, breathing/blink for idle Pip, slow everything in the pause screen.
- Restraint with the mascot: avatar in the thread, presence in onboarding/empty states, a signature-sized Pip on memory cards. Not on every surface.
