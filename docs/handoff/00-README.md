# Pip — Handoff Pack (Start Here)

> A journaling + meditation companion you text. No app to open, no blank page to stare at. Just fire off a thought or a photo, and Pip turns your days into a memory timeline you can look back on.

This pack is built to be dropped into **Claude Code / Cowork** and turned into a working, shippable PWA. Read the docs in order, then start Phase 0 in the build doc.

---

## Why this exists (the mission)

This product is the answer to a public bounty from **Bolun Li** (founder of Zogo, "Duolingo for finance," sold at 21 for $36M), posted through **@usevaya.hq** on Instagram.

His ask, in his words: journaling apps fail because they make you *open an app*. He wants something that feels like **texting a therapist during the day**. Send any thought, drop in photos, and the thing quietly builds a journal / memory timeline you can scroll back through to see how you thought and felt.

## The win condition (do not lose sight of this)

The bounty is only won when **all** of these are true:

1. The app works and genuinely feels like texting a warm companion, not filling out a form.
2. It captures text **and** photos with near-zero friction.
3. It auto-generates a **memory timeline** the user can revisit.
4. There is a **working paywall** and **at least one real person has paid** for it.
5. It is submitted to **@usevaya.hq**.

Items 4 and 5 are where most builds die. The paywall is not a "later" feature. It is the finish line. Build toward the paying customer from day one.

---

## What's in this pack

| File | What it is | Who reads it |
|---|---|---|
| `00-README.md` | This file. Orientation + win condition. | You + the build agent |
| `01-PRD.md` | Product requirements: users, features, scope, monetization, risks. | Product decisions |
| `02-brand-guidelines.md` | The brand book: Pip the mascot, colors, type, voice. | Brand + UI |
| `03-design-spec.md` | UX spec: every screen, the chat UI, the AI behavior spec, safety, data model. | Design + build |
| `04-build-handoff.md` | The build doc: tech stack, repo, phases, prompts, env, acceptance. | Claude Code / Cowork |

## How to use this with Claude Code / Cowork

1. Open `04-build-handoff.md`. It has a **START HERE** block written for the agent.
2. Keep all five files in the repo root under `/docs`. Reference them by name in your prompts.
3. Work phase by phase. Do not skip to polish. Each phase has an acceptance check.
4. When a design question comes up, the answer is in `03-design-spec.md`. When a brand question comes up (color, voice, mascot), it is in `02-brand-guidelines.md`. Do not improvise brand decisions.

## The name

**Pip** is the working name. It is a placeholder that happens to be good, not a locked decision. Swapping it is a global find-and-replace on the string `Pip`.

Alternates if you want a different feel:
- **Ray** — minimal, warm, reads like a friend's name ("text Ray").
- **Goldie** — cozy, golden, loyal-companion energy.
- **Sol** — ultra-minimal, sun + soul.

Pick one before Phase 1 so the mascot and copy stay consistent.

## Non-negotiables (the soul of the thing)

- **Frictionless capture.** If sending a thought takes more than two taps, you built the wrong app.
- **Warm, not clinical.** Pip is a caring friend, never a chatbot reading from a wellness script. No toxic positivity either.
- **The memory timeline is the payoff.** Capture is the input, looking back is the magic. Do not ship without it.
- **Safety is baked in, not bolted on.** This app touches people's hard feelings. Pip is not a therapist, says so, and knows how to respond when someone is in real trouble. See the safety section in `03-design-spec.md`. This is not optional.
- **Privacy is the product.** Journals and photos are as sensitive as data gets. Encrypt, let users export and delete, and never train on their data.

## Open decisions still on the table (owner to confirm)

- Exact subscription price (the doc recommends a range and a founder price).
- Default nudge times (morning / evening).
- Crisis-resource localization (988 US + Canada are baked in as defaults; confirm the launch region).
