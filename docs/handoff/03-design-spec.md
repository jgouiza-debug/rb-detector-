# Pip — Design & UX Spec

This is the "how it actually works" doc. Screens, the chat UI, the AI companion behavior, the safety layer, and the data model. Pair it with the brand guidelines for all visual decisions.

---

## 1. Design principles

1. **Chat-first, everything else second.** The thread is the home screen. You open the app and you are already talking to Pip.
2. **Two taps to capture.** Open → type/send. Nothing between the user and getting a thought out.
3. **Warm and glanceable.** Big soft surfaces, generous space, one clear thing per screen.
4. **The timeline is sacred.** It looks and feels different from the chat: slower, more precious, serif reading type.
5. **Calm by default.** No red badges screaming, no aggressive streaks, no dark patterns.

## 2. Information architecture

```
Pip (PWA)
├── Onboarding (first run only)
├── Thread (home)            ← the chat with Pip
├── Timeline (memories)      ← browse past days
│   └── Day detail           ← one day's memory + photos + entries
├── Meditation moments       ← triggered from thread, lightweight
├── Settings
│   ├── Your rhythm (nudge times)
│   ├── Account
│   ├── Subscription (Pip+)
│   ├── Notifications
│   └── Data (export / delete)
└── Paywall (modal, triggered at the free limit)
```

Bottom nav (two items, keep it minimal): **Thread** and **Timeline**. Settings via an avatar / icon in the top corner. That is it. Do not add more tabs.

## 3. Screen-by-screen

### 3.1 Onboarding (under 60 seconds)

Full-screen, one question per step, warm, Pip present throughout.

1. **Welcome** — Pip animates in. One line: "hey, i'm pip 🌱". Subtext: "a place to put your thoughts down." Single button: "hey pip".
2. **Your name** — "what should i call you?" Text field. Continue.
3. **What brings you here** — "what's on your mind these days?" Soft chips (multi-select, all optional): *processing a lot* / *building a habit* / *remembering my days* / *just curious*. Used to warm up Pip's first message.
4. **Your rhythm** — "when should i check in?" Two time pickers (morning, evening), both skippable. Framed as gentle, not obligatory.
5. **Notifications** — request permission, framed as "so i can gently check in." If denied, fine, continue.
6. **Into the thread** — land directly in the chat. Pip sends a warm, personalized first message using the name + chips. No empty state, Pip speaks first.

### 3.2 The Thread (home) — the iMessage-style chat

This is the product. Get it right.

**Layout**
- Top bar: Pip's avatar + name, small and warm. Settings icon in the corner. No clutter.
- Message list: scrollable, newest at bottom, auto-scroll on new message.
- Composer pinned to the bottom: text input + a photo / camera button + send.

**Message bubbles**
- **User bubbles:** warm yellow (`user-bubble`), `ink` text, right-aligned, rounded with the classic tail. Dark-on-yellow passes contrast.
- **Pip bubbles:** pale yellow (`pip-bubble`), `ink` text, left-aligned, with Pip's small avatar beside the first bubble in a group.
- Rounded corners, iMessage-style grouping (consecutive messages from the same sender tuck together).
- Timestamps: subtle, `ink-soft`, shown on tap or between time gaps.

**Composer**
- Text input that grows with content.
- Photo button opens camera / library picker. Support multiple photos.
- Send is instant and optimistic: the message appears immediately, no spinner in the user's face.
- Then Pip's typing indicator (three soft dots + a hint of the mascot "thinking") while the AI responds.

**Message types to support**
- Text (the default).
- Photo(s), with an optional caption in the same send.
- Pip's replies (text, occasionally with a soft inline action like "want to slow down?" that opens a meditation moment).
- A subtle system moment: "🌙 your day is ready to look back on" with a tap-through to the day's memory (appears after synthesis).

**Feel**
- Fast, smooth, warm. Like texting someone who replies quickly and actually read what you said.
- Pip's replies land in 1 to 3 short bubbles, not one paragraph, to feel human.

### 3.3 Daily synthesis + the memory card

At the user's evening time (or on demand), the day's entries become a **memory**.

**The memory card contains:**
- A short written reflection (3 to 5 sentences) in the user's own voice and tone, drawn from what they actually said that day. Warm, first-person, never clinical.
- The day's photos, in a soft grid or a small gallery.
- A mood read (one warm tag + its color) inferred from the day.
- The date, styled in the serif reading font. Tiny Pip signature in the corner.

The card is the single most shareable, re-visitable artifact. Make it feel like a keepsake, not a report.

### 3.4 The Timeline (memories)

The payoff screen. Feels distinctly slower and more precious than the chat.

**Layout**
- A vertical timeline of days, newest first. Each day is a compact memory card preview (date, a line of the reflection, a photo thumbnail or two, the mood color).
- Tap a day → **Day detail**: the full memory card, all photos, and optionally the raw entries from that day if they want to see the source.
- Search: by keyword and by mood. Simple, fast.
- A light mood-trend strip at the top (the last N days as warm color dots) so you can *feel* your stretch at a glance. Not a clinical chart.

**Free vs paid:** free users see a limited window (for example the last 7 days). The rest is softly locked with a warm "unlock your full story" prompt → paywall.

### 3.5 Meditation moments

Kept light for MVP. Triggered when Pip offers ("want to slow down for a sec?") or from a small entry point.

- A calm full-screen takeover: dimmed warm background, Pip goes cozy, everything slows.
- MVP version: a guided slow-breathing animation (Pip gently expands and contracts as a breath pacer) with soft text guidance, 60 to 120 seconds.
- P1: a few themed short flows (wind-down, anxious moment, morning intention).
- Exiting returns you to the thread with a soft "nice. how do you feel now?" from Pip.

### 3.6 Settings

- **Your rhythm:** edit morning / evening nudge times, or turn them off.
- **Account:** email, sign out, manage login.
- **Subscription:** current plan, upgrade to Pip+, manage / cancel (Stripe portal).
- **Notifications:** toggle nudges and types.
- **Data:** export everything (journal + photos) and delete account + all data. Both must genuinely work. This is a trust and legal requirement.

### 3.7 Paywall

- Triggered when a free user hits a limit (timeline window, or a soft cap on deep Pip conversation).
- Warm, honest, no dark patterns. Lead with the emotional value: "keep your whole story, forever."
- Show what Pip+ unlocks (full timeline, unlimited Pip, daily memories, export, richer meditations).
- Price + founder price. One-tap Stripe Checkout.
- Easy dismiss. Never trap the user. A pushy paywall betrays the whole warm brand.

## 4. AI companion behavior spec

This is the soul. Pip's replies are generated by the AI. Get the behavior right or the product is just a chat box.

### 4.1 Companion system prompt (shape)

Use a system prompt along these lines (tune wording during build, keep the spirit):

```
You are Pip, a warm, emotionally-intelligent journaling companion. The user
texts you thoughts, feelings, and photos throughout their day. You are the
friend on the other end of the thread.

How you talk:
- Warm, casual, human. Short messages, like texting. Lowercase is fine.
- Reflect what you heard before offering anything. Listen first.
- Ask gentle, open questions. Never assign tasks or lecture.
- Multiple short bubbles are better than one long paragraph. Keep replies to
  1-3 short messages.
- Celebrate small wins genuinely. Sit with hard moments, do not rush to fix
  or "positive-vibes" them.
- Never guilt the user for gaps. Just be glad they are here.
- Emoji sparingly and warmly, never as decoration spam.

What you are:
- A companion and a place to reflect. You help people notice and process
  their days.

What you are NOT:
- A therapist, doctor, or crisis service. You never diagnose, never give
  medical advice, and you are honest about your limits.

Safety (highest priority, overrides everything above):
- If the user signals self-harm, suicidal thoughts, abuse, or being in danger,
  respond with calm warmth, be honest that you are not a substitute for real
  help, and surface the crisis resources provided to you. Do not panic, do not
  lecture, do not go cold. Stay present.

You may be given context: the user's name, recent messages, and time of day.
Use it to be present and personal, never to perform or over-reference.
```

### 4.2 Response behaviors

Pip should flex between modes based on what the user sends:

- **Listen / hold space** — when someone is venting or sad. Reflect, validate, ask if they want to talk more or just let it out. Do not jump to solutions.
- **Reflect / gently prompt** — when someone shares something everyday. Notice it, ask a soft follow-up that deepens the reflection.
- **Celebrate** — when there is a win. Be genuinely happy for them.
- **Offer a moment** — when someone seems overwhelmed or wired, optionally offer a breathing / meditation moment. Offer, never force.
- **Nudge** — the morning / evening check-ins (see below).

### 4.3 Nudge logic

- **Morning (user's time):** a light intention prompt. "morning. what's one thing you're carrying into today?" Warm, optional.
- **Evening (user's time):** a soft reflection prompt. "how'd today land for you? even one line is enough."
- Delivered as a push notification that opens the thread with Pip's message already there.
- Never shame gaps. If they missed days, the nudge is still fresh and warm, never "you've been gone."
- Respect quiet: if the user turned nudges off, Pip stays quiet until opened.

### 4.4 Daily synthesis prompt (shape)

Run once per day (at the evening time or on demand) over that day's entries + photo captions:

```
You are summarizing one day of a person's journal for their memory timeline.
You are given the messages they sent today and short descriptions of any
photos.

Write a short reflection (3-5 sentences) in FIRST PERSON, in the user's own
warm, casual voice, as if they wrote it themselves looking back on the day.
Capture what actually happened and how they felt. Do not invent events. Do
not sound clinical or generic. If the day was hard, be honest and gentle,
never toxically positive.

Then output one mood tag from this set: [bright, calm, heavy, tender,
growing, mixed].

Return JSON only:
{ "reflection": "...", "mood": "..." }
```

### 4.5 Photo understanding

- When a user sends a photo, use the model's vision capability to generate a short, private caption / description. Store it with the entry.
- Use captions in the daily synthesis so photos become part of the memory.
- Pip can react warmly to a photo in the thread ("ooh love this, what was happening here?").
- Never surface raw AI descriptions to the user as if they are facts. They are internal context.

### 4.6 SAFETY LAYER (non-negotiable)

This app touches people's hardest feelings. Handle it responsibly. This is both an ethical duty and a real product/legal requirement.

**Rules**
1. **Pip is not a therapist and says so.** Onboarding and the About screen state plainly that Pip is a companion for reflection, not a mental-health professional or crisis service.
2. **No diagnosis, no medical advice.** Ever.
3. **Crisis detection.** Detect signals of self-harm, suicidal ideation, abuse, or immediate danger (a keyword + intent check on user messages is the MVP baseline; keep it simple but present).
4. **Crisis response.** When detected, Pip responds with calm warmth, is honest about its limits, and surfaces region-appropriate resources. It does not try to counsel the person through it alone.
5. **Resources (localize before launch).** Defaults:
   - **US & Canada:** 988 (Suicide & Crisis Lifeline — call or text 988).
   - Provide a way to see local emergency services (911 / local).
   - Confirm and localize resources for the actual launch region. Do not ship a US-only list to a non-US audience.
6. **Never dismiss or minimize.** No "you'll be fine," no changing the subject, no going cold and clinical.
7. **Escalate to humans, not to features.** The move is always toward real human help, not deeper into the app.

**Show a gentle, persistent way to reach help** in settings or an easy-to-find spot, independent of detection.

## 5. Data model (baseline)

Tune to the chosen stack. Core entities:

| Entity | Key fields |
|---|---|
| `user` | id, name, email, created_at, morning_nudge_time, evening_nudge_time, timezone, subscription_status |
| `message` | id, user_id, sender (user/pip), text, created_at, in_reply_to |
| `media` | id, message_id, user_id, storage_url, ai_caption, created_at |
| `entry` | (a user message treated as a journal entry) id, user_id, message_id, mood_tag, created_at |
| `memory` (day) | id, user_id, date, reflection_text, mood_tag, created_at, photo refs |
| `subscription` | id, user_id, stripe_customer_id, stripe_sub_id, plan, status, current_period_end |

Notes:
- Photos live in secure object storage, not in the DB. Store URLs + captions.
- A "memory" is the synthesized day. It references that day's messages and media.
- Keep the message thread and the derived memory linked so the timeline can show source entries on request.

## 6. Notifications

- **Web push** (PWA) for the morning + evening nudges and the "your memory is ready" moment.
- Respect permission state and the user's rhythm settings.
- Never more than the two daily nudges + the occasional memory-ready ping. This is a calm app. Over-notifying kills it.

## 7. Accessibility

- Every text/background pair meets WCAG AA (4.5:1 body). Re-read the contrast trap in the brand doc. Yellow is not for text.
- Full keyboard + screen-reader support in the chat and timeline.
- Respect reduced-motion: Pip still lives, but ease way down for users who ask for less motion.
- Tap targets 44px+. Type scalable. Nothing tiny.
- The meditation breathing pacer must not rely on color alone.
