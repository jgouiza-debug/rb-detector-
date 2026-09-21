# Builder notes — round 5 (private to the builder; the council must not read this)

Round 4 regressed: 87 → 83.5, FORCE-FIX, with the ledger flagging B2, B4 and C2.
The rule is that a regression is the only thing the next round fixes, so this
round is regressions first, then the chair's three.

## The bug that was quietly undoing earlier rounds

`app/globals.css` declared `.pt-safe`, `.pb-safe`, `.px-safe`, `.tap`,
`.font-reading` and `.font-display` **outside any layer**. Tailwind v4 puts its
utilities in a layer, and unlayered author CSS beats layered utilities regardless
of order — so `.pt-safe { padding-top: env(...) }` was silently overriding
`py-8`'s padding-top (env resolves to 0 in a browser without a notch), and
`.font-reading { line-height: 1.6 }` was killing every `leading-*` on the same
element. Onboarding padding, the settings sign-out clearance and the keepsake
date's line height were all dead. Everything is now in `@layer utilities`, and
`.pt-safe`/`.pb-safe` take a `max()` against a variable so a safe-area class can
no longer erase a padding class.

This is worth naming plainly: several "fixes" from rounds 1–4 never applied. Some
of what the council has been scoring was not what I thought I shipped.

## The A2 finding, and my own gate's blind spot

An advisor scored A2 at 5/8 against a gate reporting 0/203 targets under 44px.
It was right and the gate was wrong: `Composer.tsx`'s remove-photo button was
`size-5` (20×20) in a photo-attach state that **no gated screen had ever
rendered**, so `gauntlet/screens.ts` never measured it. The control is now a 44px
tap target hung off the thumbnail's corner, and there is a new gated screen —
`thread-composing-photo`, light and dark — that enters that state. A2's "0 under
44px" now means something closer to what it claims.

## Regressions

**B2 (consistency).** The same five crisis resources rendered as two different
components: 52px two-line rows on cream in the thread, 77px three-line rows on
white in help. Someone in trouble should meet the same object wherever they find
it, so both now use one `components/safety/ResourceList.tsx`. A lone photo now
spans the full column in the keepsake card and the memory detail, matching what
`PhotoBubble` already did. `BackLink` says "your story" for `href="/timeline"`
everywhere instead of "keepsake edition" on one screen. `rounded-2xl` retired for
`rounded-card` on every photo surface.

**B4 (motion).** Three real faults, all confirmed:
- The blanket reduced-motion rule (`transition-duration: .01ms !important`) beat
  the pacer's inline `transition`, so under reduced motion the breath *snapped*
  between scales instead of easing. The brief asks for "Pip still lives, ease way
  down". There is now one deliberate exception class, `.breath-eased`, at 1.2s.
- `--motion-scale: 1.6` on `/pause` multiplied only three animations, none of
  which render on that screen. The slow-down never reached the screen it named.
- `Bubble` animated unconditionally, so opening the thread popped the entire
  scrollback. Only messages arriving after first paint animate now.

**C2 (brand).** `moodFrom`'s bright regex had no word for "cheering", so the one
unambiguously good day in the seeded week was tagged *mixed* — Pip mis-hearing
the best thing that happened to you. Added `cheer|cheering|laughed|delight|
thrilled`. And in dark mode the user's bubble was saturated honey while Pip's was
neutral slate `#33302A`: at 1am the user was the warm voice and Pip was the cold
one. Pip's night bubble is warmed to `#3A3229`.

## C3, the repeat failure

The chair called this out correctly: round 3 flagged the closing collision, round
4 shipped the same defect in a new shape (two *Mixed* days both closing "Some of
it good, some of it not, all of it mine"). Three closings per mood was always
going to collide across a seven-day week. Now six per mood, and a closing that
repeats a word the body just used is stepped over — no more "…felt heavy. It was
heavy, and I'm still here." Sentence casing is applied after every break, so the
hero card no longer reads "Today was a lot honestly. work was heavy".
**Verified on the re-rendered week: seven distinct final sentences.**

## Also
- Mood pills were Title Case in an all-lowercase product.
- `metadata.title = "Mindful Pause"` is a named brand don't; now "a pause".
- "4-4-4-4 Box · switch rhythm" is breathwork jargon on the calmest screen; now
  "even breathing · switch" / "longer out-breath · switch".
- The pause screen offered four ways out at once; the redundant close X is gone.
- The uploading overlay's literal "…" glyph (a spinner by another name) is now a
  shape-matched bar with an sr-only "uploading".

## Known debt
- Radius drift is reduced but `rounded-xl`/`rounded-3xl` still appear.
- Timeline navigation still lives only in the top bar.
- The subscription screen still stacks two CTAs for a free user.
