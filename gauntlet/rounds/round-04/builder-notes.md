# Builder notes — round 4 (private to the builder; the council must not read this)

Round 3 gained 1.5 points. The plateau rule halts the loop at under 2 points over
two rounds, so this round goes after the largest standing gap rather than tidying.

## The keepsake generator, rewritten rather than patched

Rounds 1 and 3 both "fixed" the templating and both left a seam. What was still
wrong after round 3:

- `closing[mood]` was a fixed six-string map, so any two days sharing a mood ended
  on the identical sentence. Two Heavy days read as one machine talking twice.
- The `BRIDGES` connective was not stripped when the next line already began with
  a conjunction, producing "Later on, but i made it through".
- Round 3's own "fix" for titles — a bag of the day's nouns — produced
  "Walk, under, amber". That was worse than the problem it replaced.

`synthesizeDay` is now built on one idea: **the last thing you said is where the
day landed, so it makes the title; the body is everything before it.** Nothing is
said twice, and the title is a real sentence in the writer's own words ("Three
days of fog just lifted", "We're getting dinner next week"). Each mood carries
three closings chosen by a hash of the day's own text, so the same day always
reads identically and different days almost never share a shape. A line that
brings its own connective ("but i made it through") leads on its own instead of
being bridged into.

## One seeded day now carries a photo

The design spec has the keepsake card holding the day's images, and no capture in
four rounds had ever shown one — the fixture only ever wrote text, so the whole
surface was invisible to every review of it. `/api/dev/seed` now runs the real
`processImage` path on `tests/e2e/fixtures/photo.jpg` for one day. (It is a flat
test image, so it renders as a solid block; that is the fixture, not the layout.)

## Vertical anchoring
- `welcome` moves onto `StepShell`, so the first screen and the second put their
  content and their button in the same places instead of one centring and one not.
- `StepShell` content is `justify-start pt-8`: the answer you are typing no longer
  slides down the screen as the keyboard opens.
- The subscription CTA is sticky at the bottom, so it stays reachable while the
  benefits scroll past it.
- `MessageList` gets bottom padding so the newest message clears the sticky composer.
- `backdrop-blur-md` is gone from both the top bar and the composer. At 90-95%
  opacity over cream it rendered as a smear and bought nothing.

## Four out-of-fixture defects
- `StepShell` reported `aria-valuenow={step}` while rendering `(step+1)/(total+1)`:
  a screen reader heard "1 of 4" against a bar showing 40%. Now `aria-valuetext`
  carries the human phrasing and `aria-valuemin` starts at 1.
- `SystemMoment`'s "your day is ready" link was tappable but under 44px.
- `MessageList` auto-scrolled with `behavior: "smooth"` regardless of
  `prefers-reduced-motion`. It now jumps instantly for users who asked for less.
- `Bubble`'s round-3 `aria-label` repeated the message text that was already the
  button's accessible name, so screen readers announced every message twice. The
  hint moved to `title`.

## Known debt
- `rounded-2xl` and `rounded-card` still coexist.
- Timeline navigation lives only in the top bar, not the thumb zone.
- The fixture photo is a flat colour block; a real image would exercise the
  keepsake's image layout properly.
