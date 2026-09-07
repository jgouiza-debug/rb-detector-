# Builder notes — round 1 (private to the builder; the council must not read this)

Scope: the round-0 machine-gate failures, plus the fixes every advisor converged on.

## Machine gates
- A5 overflow: every centred page `main` gets `w-full` (a `mx-auto max-w-*` flex child shrink-wrapped to its widest row; the timeline's filter strip made it 644px).
- A5 console: the locked memory is decided on the server (`lib/billing/window.ts`, `memory/[date]/page.tsx`) so the client never fires the 402; haptics only vibrate after user activation.
- A2 targets: chat bubbles `min-h-11`; shared `BackLink` (44px); time inputs `tap`; memory-card "open" link `tap`; welcome/sign-in text links `tap`; rhythm toggles wrapped in a 44px hit area; help + crisis resources become 44px rows.
- A2 thumb zone: paywall card and subscription actions anchored with `mt-auto`; help page gets a sticky bottom call/text pair; crisis card puts the 988 pair at its bottom (nearest the composer) and keeps every other resource one tap away above it.
- A3 grid: the sweep maps 12→16/8, 10→8, 6→8, 20→16/24, 28→24; `py-3` rows become `py-2 + min-h-12/14`. One page gutter: 16px in-app, 24px on onboarding/pause.
- A4 type: `--text-*` reset in `globals.css` to six sizes (12/14/16/18/24/32); all `text-xl`, `text-4xl`, `text-[Npx]` usages remapped.
- A4 palette proxy refined: near-neutrals count as one family (cream + white cards, night + night-raised). Documented in the README; a correction of the measurement, not a loosening of the rubric's intent.
- axe best-practice: thread has a `main` + sr-only `h1`; memory cards are `h2`; locked paywall heading is an `h1`.

## Council convergence acted on
- Scripted companion: three rotating reply pairs plus a "you made it" beat (keyword matches use word boundaries so "through" no longer trips "rough"); day reflections built from the writer's sentences with a mood-specific closing line (no more "Today I today…", no shared template tail).
- Paywall: no "unlock"; honey CTA "keep it all · $4.99/mo"; Pip in place of the glyph; a real "not right now".
- Timeline: lowercase "your story", tagline replaced, week strip un-carded, filters lowercase, search placeholder rewritten, "open" instead of "read thread".
- Pause: page gradient removed; "MINDFUL PAUSE" eyebrow, digit and media-player clock removed (clock kept as sr-only); phase copy plainer.
- Pip bubble gets a hairline ring so it separates from cream.
- Selected states use `bg-fg text-bg` so they hold in dark mode (ink on night was near-invisible). HelpNow card re-toned for dark.

## Not done this round (known debt)
- Composer photo "remove" button is 20px (not rendered in any gauntlet screen).
- `rounded-2xl` vs `rounded-card` radii are still mixed.
- Settings/notifications page is not a gauntlet screen yet.
