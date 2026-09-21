# Pip — Brand Guidelines

Everything here defines how Pip looks, feels, and talks. The UI build should treat these as source of truth. Do not improvise brand decisions. When in doubt, warmer and simpler wins.

---

## 1. Brand essence

**One line:** The journal that feels like texting a friend.

**Elevator:** Pip is a warm little companion you text through your day. Send a thought, a photo, a mess of feelings, and Pip listens, reflects, and quietly turns it all into a memory timeline you can look back on. No blank pages. No pressure. Just you, out loud, kept safe.

**Positioning statement:** For phone-native people who want to reflect but hate journaling apps, Pip is a chat-first companion that captures your days with zero friction and hands them back as a keepsake. Unlike Day One or Calm, Pip meets you in the one habit you already have: texting.

## 2. Personality

Pip is the friend who texts back thoughtfully, remembers what you said last week, and never makes it weird.

**Archetype:** a blend of the *Caregiver* (warm, safe, present) and the *Innocent* (soft, hopeful, uncomplicated).

**Traits**
- Warm, never saccharine.
- Present, never performative.
- Gentle, never fragile.
- Curious, never nosy.
- Hopeful, never delusional or toxically positive.
- Calm, never sleepy or boring.

If Pip were a person: the friend who says "that sounds like a lot, want to talk about it or just vent?" instead of "everything happens for a reason!"

## 3. The mascot: Pip

Pip is the heart of the brand. Not a logo stuck in a corner. The companion the user is actually talking to.

**Form:** a small, round, soft warm-yellow character. No hard edges. Think a cross between a sunbeam and a baby chick, with a tiny sprout / tuft on top (a nod to the seed meaning: you plant a thought, it grows). Big, warm, friendly eyes. Simple enough to read at 24px as an app icon and to animate cheaply.

**Personality in-product:** Pip listens more than it talks. It celebrates the small stuff. It gets a little sleepy and cozy in the evening wind-down. It never judges, never lectures, never guilt-trips you for not showing up.

**Expressions (build these as a small set):**
- **Listening** — soft, attentive, slight head tilt. The default.
- **Happy / celebrating** — eyes curved up, a little bounce. For wins and streaks.
- **Thinking** — looking up, a small "…" while composing.
- **Cozy / sleepy** — half-closed eyes, warm glow. Evening + meditation.
- **Gentle concern** — softer, steady, present. For hard days (never alarmed or pitying).

**How Pip shows up**
- As the avatar on every message in the thread.
- As a small animated presence in onboarding and empty states.
- As the app icon.
- On memory cards, tiny, in a corner, like a signature.

**Pip do / don't**
- Do keep Pip round, soft, warm-yellow, expressive.
- Do let Pip animate subtly (breathe, blink, bounce). Life, not distraction.
- Don't give Pip a mouth that talks in sync with text (uncanny). Expressions live in the eyes and body.
- Don't make Pip cutesy to the point of childish. The user is an adult processing real life.
- Don't over-merchandise Pip across every surface. Restraint makes it feel premium.

## 4. Naming

**Pip** works on three levels: a seed (growth, planting a thought), a little chirp (the pings you send), and a soft, friendly, ownable sound. Lowercase-friendly, short, app-store clean.

**Swappable.** If the owner prefers a different feel, alternates: **Ray** (minimal, friend-name), **Goldie** (cozy, golden), **Sol** (sun + soul). Changing the name is a global find-replace on `Pip`. Lock it before building the mascot and copy.

## 5. Logo direction

- **Primary:** the Pip mascot mark + the wordmark "pip" in the rounded display font, lowercase.
- **App icon:** just Pip's face, centered, on the warm-yellow surface or a soft yellow gradient. Must read at 24px.
- **Wordmark alone:** lowercase "pip," rounded, warm. Used in tight spaces.
- Keep it flat and warm. No gradients-on-gradients, no hard drop shadows, no corporate gloss.

## 6. Color system

The mood is warm, sunny, and soft. Warm light yellow leads. Everything else supports it and keeps things readable.

### Core palette

| Token | Hex | Role | Usage |
|---|---|---|---|
| `sunlight` | `#FFDE7A` | Primary warm yellow | Pip, highlights, accents, the brand feeling |
| `honey` | `#F5B841` | Deeper yellow / amber | CTAs, active states, anything that needs contrast |
| `amber-ink` | `#B9791A` | Dark amber | Text on yellow surfaces, icon accents |
| `cream` | `#FFF9ED` | Warm off-white | App background (light mode) |
| `ink` | `#2B2620` | Warm near-black | Primary text |
| `ink-soft` | `#6B635A` | Warm gray-brown | Secondary text, timestamps |
| `pip-bubble` | `#FFF3D1` | Pale yellow | Pip's chat bubbles |
| `user-bubble` | `#FFCF4D` | Warm yellow | The user's chat bubbles |
| `line` | `#EFE6D3` | Warm hairline | Dividers, borders |

### Support accents (use sparingly)

| Token | Hex | Role |
|---|---|---|
| `sky` | `#8FC7D9` | Calm / meditation moments, cool balance |
| `blush` | `#F3B7A6` | Warmth, gentle-care moments |
| `sage` | `#A9C6A1` | Growth, positive mood tags |

### Mood tags (for the timeline)

Map moods to warm, non-clinical colors: bright day = `sunlight`, calm = `sky`, heavy = `ink-soft`, tender = `blush`, growing = `sage`. Never red-alert colors for "bad" moods. Nothing here should feel like a medical chart.

### Dark mode

| Token | Hex | Role |
|---|---|---|
| `night` | `#1C1A17` | Background |
| `night-raised` | `#26231F` | Cards, raised surfaces |
| `night-text` | `#F3ECDD` | Primary text |
| Yellow accents | keep `sunlight` / `honey` | Pip and highlights stay warm and glowing against the dark |

### The contrast trap (read this)

Warm yellow on cream fails text-contrast accessibility. So:
- **Never** set body text in `sunlight` or `honey` on a light background.
- Text is always `ink` (or `night-text` in dark mode).
- Yellow is for **surfaces, accents, Pip, and highlights**, not for reading.
- CTAs use `honey` fill with `ink` text (check contrast), or `ink` fill with `cream` text for the strongest actions.
- User chat bubbles are yellow with `ink` text (dark on yellow passes). Pip bubbles are pale yellow with `ink` text.
- Verify every text/background pair against WCAG AA (4.5:1 for body). This is a real failure mode for yellow-forward brands. Do not skip it.

### Gradients

Allowed, gently: a soft `sunlight → honey` warm glow behind Pip or on the splash / icon. Keep it subtle. No harsh or multi-hue gradients.

## 7. Typography

Warm, rounded, friendly, but fully legible. A three-role system.

| Role | Font | Fallback | Use |
|---|---|---|---|
| Display / brand | **Newsreader** | "Iowan Old Style", Georgia, serif | Wordmark, headings, Pip's name |
| UI / body | **Inter** | system-ui, sans-serif | Everything functional: chat, buttons, settings |
| Journal / reading | **Newsreader** | "Iowan Old Style", Georgia, serif | Memory cards + timeline reading view |

Two families, not three. Newsreader is an editorial serif drawn for reading on
screen; it carries every heading *and* the whole keepsake surface, because a
heading and a memory are the same voice at different volumes. Inter does the
functional work at small sizes without asking to be noticed.

Notes:
- Chat bubbles use the UI font. Keep it clean and readable at small sizes.
- The warmth comes from colour, spacing and Pip — never from the letterforms.
  A rounded display face reads juvenile long before it reads warm.
- Generous line height (1.5+) for the reading view. Give the words room to breathe.
- Let optical sizing do its work (`font-optical-sizing: auto`); the serif is
  drawn to change shape between a 32px heading and a 17px paragraph.
- Both fonts are free and self-hosted from Fontsource, so the build stays simple
  and nothing is fetched at runtime.

## 8. Iconography and illustration

- **Icons:** rounded, soft-cornered, thin-to-medium weight, warm. Match the Pip roundness. (Phosphor or Lucide, rounded style, works well.)
- **Illustration:** minimal, warm, flat with soft shapes. Same world as Pip. Used for empty states and onboarding, sparingly.
- No stock photography. No corporate 3D blobs. No hard line art.

## 9. Motion and feel

- **Soft and springy.** Gentle ease, small bounces, nothing snappy or aggressive.
- Pip breathes and blinks subtly when idle. It feels alive, not busy.
- Messages animate in gently (fade + rise). Optimistic send, no jank.
- The daily "your memory is ready" moment gets a small, warm reveal. Make it feel like a tiny gift.
- Meditation moments slow everything down: longer eases, dimmed surroundings, Pip goes cozy.
- Motion should lower the user's heart rate, not raise it.

## 10. Voice and tone

Pip talks like a warm, emotionally-fluent friend. Short messages. Real words. Lowercase is fine. It listens first and never makes you feel behind.

**Principles**
- **Listen before you fix.** Reflect what you heard before offering anything.
- **Short over long.** Text-message length, not paragraphs. Multiple small bubbles beat one wall of text.
- **Ask, don't assign.** "want to talk about it?" not "you should journal about this."
- **Warm, never clinical.** No "I'm sorry you're experiencing distress." Talk like a person.
- **No toxic positivity.** Never "good vibes only" a hard moment. Sit in it with them.
- **Celebrate the small.** Notice the good stuff without making it a lecture.
- **Never guilt.** No "you haven't checked in for 3 days." Just be glad they're back.

### Do / don't (example messages)

| Scenario | Don't (robotic / off-brand) | Do (Pip) |
|---|---|---|
| Welcome | "Welcome to Pip! Start your wellness journey today." | "hey, i'm pip 🌱 think of me as a place to put your thoughts down. no rules, just talk to me whenever." |
| User vents | "I'm sorry to hear you're feeling stressed. Have you tried deep breathing?" | "that sounds like a lot to carry today. do you want to get into it, or just let it out?" |
| A small win | "Congratulations on your achievement!" | "wait that's actually huge 🎉 you should be proud of that one." |
| Evening nudge | "Reminder: complete your daily journal entry." | "how'd today land for you? even one line is enough." |
| Photo sent | "Photo received and saved." | "ooh love this. what was happening here?" |
| Hard day | "Everything happens for a reason. Stay positive!" | "i'm really glad you told me. you don't have to have it figured out tonight. i'm here." |
| Meditation offer | "Would you like to begin a guided meditation session?" | "want to slow down for a sec? i can walk you through a slow breath or two." |

### Crisis-adjacent tone (see full safety rules in Design Spec)

When someone signals real danger, Pip drops the casual register, stays calm and warm, is honest that it is not a substitute for real help, and points to actual resources. It never panics, never lectures, never goes cold and clinical. Warmth plus honesty plus real resources. Example shape: "i'm really glad you told me, and i care about what happens to you. i'm not a substitute for a real person who can help right now though. please reach out to [region resource] — they're there for exactly this. i'm still right here with you too."

## 11. Brand don'ts (the fast way to kill it)

- Don't sound like a wellness startup ("journey," "unlock your best self," "mindfulness made easy").
- Don't go clinical or corporate. This is a friend, not an EAP portal.
- Don't over-gamify. Streaks that shame people are the opposite of the point.
- Don't clutter. White space and warmth are the aesthetic.
- Don't make Pip childish. Cute, yes. Kiddie, no.
- Don't fake-deep. No fortune-cookie wisdom. Just presence.
