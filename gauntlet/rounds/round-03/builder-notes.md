# Builder notes — round 3 (private to the builder; the council must not read this)

Round 2's council found four defects the machine gates could not see. Three of
them were invisible for the same reason: the gate runner measured every screen
at scroll position 0, in one motion mode, on one rendered state.

## The one that mattered

`app/globals.css` had `html, body { height: 100% }`. That caps every page's
containing block at exactly the viewport, so a `position: sticky` header inside
it has **zero travel** — it scrolls away with the content instead of pinning.
Measured live before the fix, on the thread at the newest message: the top bar
sat at `top: -621px`. The app's home screen had no identity and no route to the
timeline or settings the moment you were actually reading. The composer looked
fine only because you were already at the bottom of the document.

`height` → `min-height`. Verified live after: thread scrolled 1409px, header
`top: 0`; timeline scrolled 900px, header `top: 0`.

**This is now a gate.** `A5.sticky` probes every `sticky`/`fixed` element at the
top of each screen, scrolls to the bottom, and re-measures. Anything that leaves
the viewport fails A5 and trips the broken-state cap. 9/9 pass this round. A
council should never have to find this class of bug twice.

## The rest
- Reduced motion is a blanket now, not a list. The old block named individual
  classes, so `Skeleton`'s Tailwind `animate-pulse` kept animating for users who
  asked for less motion — and the gate missed it because skeletons only render
  during synthesis. `*, *::before, *::after` now forces `animation-duration:
  0.01ms` and `animation-iteration-count: 1`, which also covers every animation
  added from here on.
- `heavy` mood had `bg: palette.line` — the exact colour of the "no entry" dot.
  A day you got through looked identical to a day you skipped, on the strip whose
  whole job is showing your week honestly. Heavy now has its own `heavyTint`
  (#D6CCBC), and the contrast test pins the new pair.
- The keepsake stopped being visibly stitched: the fixed `"Later,"` connective
  becomes one of six bridges seeded from the day's own text (same day, same
  reading; different days, different seams), and card titles are drawn from the
  day's concrete nouns instead of the first four words of the body it sits above.
- `settings/subscription` was a 96px card over ~548px of nothing. It now lists
  what the money actually buys, in the paywall's own words, with the CTA in the
  thumb zone. "refresh status" — engineering vocabulary on a customer screen —
  becomes "just paid? tap here". "Pip+" is lowercase everywhere, and the price
  reads "keep it all · $4.99/mo", matching the paywall.
- Onboarding's progress bar: 500ms → 300ms, the last animation outside the band.
- Chat bubbles are buttons; they now say so ("you: … — tap for the time").

## Known debt
- `rounded-2xl` and `rounded-card` still coexist in a few components.
- The keepsake card carries no photos in any capture; the design spec asks for
  them and the fixture never seeds one.
- Timeline navigation still lives only in the top bar, not the thumb zone.
