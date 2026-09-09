# Round 14 — builder notes

Round 13 scored **median 91** (85 / 87 / 91 / 93 / 94) — climbing again (83 → 86
→ 90 → 90 → 91). This round builds the advocate's standing #1 and fixes the two
regressions round 13's own crisis takeover introduced. Tier A passes on all
five, no caps, 38 renders (keepsake-reveal added).

## The keepsake, handed over once (advocate's #1 for three rounds)

`KeepsakeReveal` is a full-screen moment — Pip, "your day, kept", the mood, the
keepsake in serif, a single "keep it" — shown the first time today's memory is
opened, then remembered in localStorage so it never re-happens. The underlying
detail and timeline cards stop re-firing `animate-keepsake-in` on every visit;
the reveal owns the arrival now.

Per-device, by localStorage, on purpose: a daily keepsake replaying its reveal
once on a new device is harmless, and it costs no schema and no migration risk.
`alreadyRevealed()` fails safe (treats blocked storage as revealed, so it can
never trap someone who can't dismiss-and-remember it), and Esc dismisses it.

## Fixing round 13's own regressions

- **The crisis takeover stranded keyboard focus.** `crisisActive` flips true
  async after submit while focus is still in the composer, which then unmounts —
  focus fell to `<body>` at the worst moment. `CrisisCard` takes focus on mount
  now (`tabIndex={-1}` + ref), so a keyboard or SR user lands on the resources.
- **I claimed the dark elevation ring cleared WCAG 1.4.11's 3:1 and it measured
  1.23:1.** That is the over-claiming pattern the systems designer caught me on
  twice; I wrote a compliance number I hadn't computed. Fixed both: the general
  ring's comment now honestly says ~1.2:1 (a depth whisper, not a boundary), and
  the crisis card — the one surface that must read as a held object — gets
  `--card-edge-strong` (#76726a), **computed** at 3.63:1 vs the page and 3.29:1
  vs the card fill.
- **The settings gear stayed reachable during the takeover.** Suppressed now,
  with the composer and nav.

## Council fixes

- **Pip was over-merchandised on the timeline** — 3 avatars and "kept" ×6 in one
  viewport, against the brand book's "tiny, in a corner, like a signature". The
  header reads "days of you", and `MemoryCard`'s footer drops its avatar and the
  repeated "kept". One Pip in the viewport now. (taste)
- **`runSend` marked an already-sent message failed on a mid-stream drop** —
  false "tap to retry" and a double-send risk. Guarded on `sawSaved`. (interaction)
- **The composer send/mic buttons** — the two highest-frequency taps — used a
  harsh `scale-95` with no duration; now the brand's soft `scale-[0.98]`
  ease-soft. (interaction)
- **checkout-done's generic string** ("you're all set / welcome to pip+", the
  one could-be-any-app copy left) → "thank you, really / every day you write is
  yours to keep". (taste red flag)
- **The onboarding CTA spread** (~64px, open three rounds): `StepShell` reserves
  the two-button footer height and top-aligns, so the primary lands at the same
  Y whether or not a step has a "skip". (systems B2)
- **The eyebrow's `tracking-wide`** (a caps-era leftover) dropped; **`Pill`'s
  `font-bold`** (the app's only one) → `font-semibold`, so shipped weights are
  400/600. (taste/systems)
- **VoiceSheet's listening→review swap** focuses the transcript. (ergonomics)
- The 402 "unlock" string and a fourth redundant "free" promise gone; the
  email-link fixture frames over the timeline, not crisis history.

## Known and still open — for the council

- The reveal is per-device (localStorage), not per-account. A server `viewedAt`
  would make it once-ever; I judged the migration risk not worth it for a
  delight moment, but the council may disagree.
- The `role="log"` 600ms timer is still a heuristic (not racing in SSR).
- 988 is last in screen-reader reading order (intentional for thumb reach).
- The crisis restore line is a caption, not a pill (taste suggested a subtle
  pill to signal pressability); the prior Pip bubble is sliced under the top bar
  on crisis activation (taste suggested a scroll offset).
- PhotoBubble has no entrance animation; PaywallCard stacks a redundant shadow
  layer in dark. Both cosmetic.
