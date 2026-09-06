# Pip — Build Handoff (for Claude Code / Cowork)

> This doc is written for the coding agent. Read it top to bottom before writing code.

---

## START HERE (read this first)

You are building **Pip**: a journaling + meditation companion delivered as an installable PWA, where the user texts a warm AI companion and their days get turned into a memory timeline.

Before you write anything:

1. Read all five docs in `/docs`: `00-README.md`, `01-PRD.md`, `02-brand-guidelines.md`, `03-design-spec.md`, and this file.
2. The **win condition** is in the README: working app + memory timeline + a real paying customer, submitted to @usevaya.hq. The **paywall is the finish line**, not a "later" feature. Build toward it.
3. Follow the **phases** below in order. Each has an acceptance check. Do not jump ahead to polish.
4. All visual/brand decisions come from `02-brand-guidelines.md`. All UX decisions from `03-design-spec.md`. Do not improvise brand or design choices.
5. **Safety is mandatory** (see the safety section in the design spec). Do not ship without it.

Confirm you have read the docs, then begin Phase 0.

---

## Mission recap

Reflection that feels like texting a friend. Zero-friction capture (text + photos), a warm non-clinical AI companion (Pip), automatic daily synthesis into memory cards, and a revisitable timeline. Freemium with a Stripe paywall.

## Recommended tech stack

Chosen for speed, a great chat/PWA experience, and being easy for you (the agent) to build end to end.

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript** | One codebase for UI + API, great PWA support, Vercel-native |
| Styling | **Tailwind CSS** | Fast, token-friendly, maps cleanly to the brand palette |
| PWA | **next-pwa** (or manual service worker) + web-push | Installable, offline-tolerant, push notifications for nudges |
| Auth + DB + storage | **Supabase** (Postgres + Auth + Storage) | Auth, database, and photo storage in one, fast to wire |
| AI | **Anthropic API (Claude)** | The companion replies, daily synthesis, and photo understanding (vision) |
| Payments | **Stripe** (Checkout + Customer Portal + webhooks) | The paying-customer requirement, simplest reliable path |
| Hosting | **Vercel** | One-command deploy, env management, cron for nudges/synthesis |
| Scheduling | **Vercel Cron** (or Supabase scheduled functions) | Trigger daily synthesis + nudge sends |

Notes:
- If the owner prefers a different stack, keep the shape: a full-stack JS framework, a Postgres + auth + storage provider, the Anthropic API, and Stripe.
- Set the brand palette from `02-brand-guidelines.md` as Tailwind theme tokens on day one so the whole build is on-brand by default.

## AI model choice + cost

- **Companion replies:** use a **cost-efficient Claude model (Sonnet tier)** for the everyday back-and-forth. This is the high-volume path, so keep it lean: cap the context window to the recent thread, keep replies short.
- **Daily synthesis + photo captioning:** Sonnet tier is fine; batch synthesis once per day per user rather than continuously.
- Watch **tokens per active user per day**. Trim message history sent to the model. This is the main variable cost.

## Repo structure (suggested)

```
pip/
├── docs/                      # all five handoff docs
├── app/
│   ├── (onboarding)/          # onboarding flow
│   ├── thread/                # the chat home
│   ├── timeline/              # memories + day detail
│   ├── settings/
│   ├── api/
│   │   ├── chat/              # POST: user message -> Pip reply (Claude)
│   │   ├── synthesize/        # daily synthesis job
│   │   ├── nudge/             # scheduled nudge sender
│   │   ├── stripe/            # checkout + webhook
│   │   └── push/              # web-push subscribe
│   └── layout.tsx
├── components/
│   ├── chat/                  # bubbles, composer, typing indicator
│   ├── pip/                   # the mascot + expressions
│   ├── timeline/              # memory card, day detail
│   └── ui/                    # shared primitives
├── lib/
│   ├── ai/                    # Claude client, prompts, safety check
│   ├── supabase/              # client + queries
│   ├── stripe/
│   └── push/
├── public/                    # icons, manifest, Pip assets
├── styles/
└── ...
```

## Environment / setup

Accounts / keys needed:
- **Supabase**: project URL + anon key + service role key.
- **Anthropic**: API key.
- **Stripe**: secret key, publishable key, webhook signing secret, a price ID for Pip+.
- **Vercel**: for deploy + cron + env vars.
- **VAPID keys**: for web push.

`.env` shape:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PIP_PLUS=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_APP_URL=
```

Never expose the service role key, Stripe secret, or Anthropic key to the client.

## Coding conventions

- TypeScript everywhere, typed DB queries.
- Server-side for all AI, Stripe, and privileged DB work. The client never holds secrets.
- Optimistic UI in the chat (message appears instantly, Pip's reply streams / arrives after).
- Keep components small and the brand tokens centralized.
- Handle loading, empty, and error states for every screen (see design spec).

## Build phases

Work these in order. Each ends with an acceptance check. Do not move on until it passes.

### Phase 0 — Foundation
- Scaffold Next.js + TS + Tailwind. Set brand tokens (colors, fonts) from the brand doc.
- Set up Supabase (Auth + DB tables from the data model + Storage bucket for photos).
- Deploy a skeleton to Vercel with env vars wired.
- **Acceptance:** app deploys, a user can sign up / log in, brand fonts + colors are live.

### Phase 1 — The Thread (capture)
- Build the iMessage-style chat UI: bubbles, grouping, composer, photo send, typing indicator (per design spec 3.2).
- Persist every user message + photo to Supabase. Optimistic send.
- Pip echoes a placeholder reply for now (no AI yet).
- **Acceptance:** a user can send text + photos, they persist, and the thread feels smooth and on-brand.

### Phase 2 — Pip comes alive (AI + safety)
- Wire the Anthropic API. Implement the companion system prompt (design spec 4.1) and short, warm, multi-bubble replies.
- Implement photo understanding (vision caption stored with media).
- **Implement the safety layer** (design spec 4.6): crisis detection + calm resourceful response + resources in settings. Do not skip.
- **Acceptance:** Pip replies warmly and in-character, reacts to photos, and handles a crisis-signal test message correctly and safely.

### Phase 3 — Memories (synthesis + timeline)
- Build the daily synthesis job (design spec 4.4): turn a day's messages + photo captions into a first-person reflection + mood tag. Store as a `memory`.
- Build the memory card + the timeline + day detail (design spec 3.3 / 3.4). Use the serif reading font. Make it feel like a keepsake.
- Trigger synthesis at the user's evening time (Vercel Cron) and on demand.
- **Acceptance:** after a day of messages, a memory card is generated and appears in the timeline with photos + mood; past days are browsable and searchable.

### Phase 4 — Rhythm (nudges + meditation)
- Web push setup (VAPID). Send the morning + evening nudges that open the thread with Pip's message (design spec 4.3).
- Build the MVP meditation moment: the breathing pacer with Pip going cozy (design spec 3.5).
- **Acceptance:** nudges fire at the right local times and open into the thread; the breathing moment works and feels calm.

### Phase 5 — The finish line (paywall)
- Freemium gating: free = capture + limited timeline window; Pip+ = full timeline, unlimited depth, export, richer meditations.
- Stripe Checkout + Customer Portal + webhooks to set `subscription_status`.
- The paywall screen (design spec 3.7): warm, honest, one-tap checkout, founder price.
- Data export + delete in settings (must genuinely work).
- **Acceptance:** a real person can hit the paywall, pay through Stripe, and unlock Pip+. Export + delete work. **This is the bounty finish line.**

### Phase 6 — Brand polish
- The Pip mascot + its expression set, subtle idle animation, onboarding delight, the "memory ready" reveal.
- Empty states, micro-animations, final contrast + accessibility pass.
- **Acceptance:** it feels like a warm, finished product a stranger would happily pay for.

## Payments (Stripe) specifics

- Use **Stripe Checkout** for the subscription (simplest, hosted, secure).
- One product (Pip+), one recurring price (set `STRIPE_PRICE_ID_PIP_PLUS`). Add an annual price later.
- **Customer Portal** for manage / cancel.
- **Webhooks** update `subscription.status` and `current_period_end`. Gate paid features on server-verified status, never on client state.
- Test with Stripe test mode, then switch to live for the real paying customer.

## PWA + push specifics

- Web app manifest (name "Pip", the Pip icon, warm theme color), installable.
- Service worker for install + basic offline shell.
- Web push via VAPID for nudges + memory-ready. Store push subscriptions per user. Respect permission + rhythm settings.

## Acceptance criteria (mapped to the bounty)

The app is submittable when a stranger can:

1. Sign up and meet Pip in under 60 seconds. *(Phase 0-1)*
2. Text Pip a thought + a photo and get a warm, human, in-character reply. *(Phase 2)*
3. Return the next day and find the previous day captured as a memory in the timeline. *(Phase 3)*
4. Hit the paywall, pay through real Stripe checkout, and unlock Pip+. *(Phase 5)*
5. Trust it with sensitive data: export + delete work, safety layer is present. *(Phase 2 + 5)*

And: **at least one real person has paid.** Then submit to @usevaya.hq.

## Definition of done / launch checklist

- [ ] Onboarding under 60 seconds, Pip speaks first.
- [ ] Chat feels like iMessage: smooth, optimistic, warm, photo send works.
- [ ] Pip replies in-character (test against the Do/Don't in the brand doc).
- [ ] Safety layer tested with crisis-signal inputs. Resources localized for launch region.
- [ ] Daily synthesis produces genuine, first-person memory cards.
- [ ] Timeline is browsable, searchable, and feels like a keepsake.
- [ ] Nudges fire at correct local times and deep-link into the thread.
- [ ] Paywall works, real Stripe payment succeeds, features gate on server-verified status.
- [ ] Data export + delete genuinely work. Privacy policy in place.
- [ ] WCAG AA contrast pass (mind the yellow). Reduced-motion respected.
- [ ] Installable PWA, on-brand icon + theme.
- [ ] One real paying customer. Submit to @usevaya.hq.

## Pointers

- Product scope + monetization + risks → `01-PRD.md`
- Colors, type, mascot, voice → `02-brand-guidelines.md`
- Screens, chat UI, AI prompts, safety, data model → `03-design-spec.md`
- Mission + win condition + how to use this pack → `00-README.md`
