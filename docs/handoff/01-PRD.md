# Pip — Product Requirements Document (PRD)

**Working name:** Pip
**Type:** Journaling + meditation companion, chat-first, delivered as an installable PWA
**Status:** Scoping → build
**North star:** Win the @usevaya.hq / Bolun Li bounty (working app + memory timeline + a paying customer).

---

## 1. The problem

People want to journal and reflect. Almost nobody keeps it up. The reason is not laziness, it is friction. Traditional journaling apps ask you to:

- Remember the app exists.
- Open it on purpose.
- Face a blank page or a rigid prompt.
- Write something "worthy" of the entry.

That is four points of failure before a single word gets written. Meanwhile the same person will text a friend fifteen times a day without thinking about it. Texting is a habit that already exists. Journaling is a habit that has to be forced.

## 2. The insight

**Meet the user where the habit already lives: the text thread.**

If reflection feels like texting someone who actually listens, the friction disappears. You do not "journal." You just talk to Pip through your day. The structure, the journal, the memories, all of that gets built for you in the background. The user does the easy part (talking). The product does the hard part (turning it into something worth keeping).

## 3. Product vision

Pip is the friend on the other end of the thread who remembers everything, judges nothing, and hands your life back to you as a keepsake. Over weeks, the timeline becomes a mirror: this is how you thought, this is what your days looked like, this is you getting through it.

One line: **the journal that feels like texting a friend.**

## 4. Target user

Primary: 18 to 30, phone-native, has tried and quit a journaling or meditation app (Day One, Stoic, Calm, Notes app). Wants to be more self-aware but hates "productivity journaling" rituals. Comfortable paying a few dollars a month for something that actually sticks.

Secondary: anyone going through a lot (a move, a breakup, health stuff, a big year) who wants a low-effort place to process and a record to look back on.

Not the target: people who want a full clinical mental-health platform, or hardcore bullet-journal / long-form writers who want a blank canvas.

## 5. Goals and non-goals

**Goals**
- Make capturing a thought or photo feel effortless and even nice.
- Make Pip feel warm, present, and genuinely helpful, never scripted.
- Turn scattered daily input into a beautiful, revisitable memory timeline.
- Ship a real paywall and convert at least one real paying user.

**Non-goals (for the bounty MVP)**
- Real iMessage / SMS integration. Apple locks third parties out of iMessage. The experience is an iMessage-*style* chat inside the PWA. (SMS via Twilio is a possible future, out of scope now.)
- Voice notes, native mobile apps, social / sharing features, AI-generated art. All later.
- Being or replacing a therapist. Pip is a companion with hard safety limits (see Design Spec).

## 6. The bounty north star (acceptance criteria)

The build is "done enough to submit" when a stranger can:

1. Sign up and meet Pip in under 60 seconds.
2. Text Pip a thought and a photo and get a warm, human reply.
3. Come back the next day and find yesterday captured as a memory in a timeline.
4. Hit a paywall, pay, and unlock the full experience through a real checkout.

If all four work end to end and one real person has paid, submit to @usevaya.hq.

## 7. Core user loop

```
   ┌─────────────────────────────────────────────┐
   │  1. Pip nudges gently (morning / evening)    │
   │     or the user opens the thread on their own │
   └───────────────────────┬─────────────────────┘
                           ▼
   ┌─────────────────────────────────────────────┐
   │  2. User texts a thought and/or a photo      │
   │     (near-zero friction, like iMessage)       │
   └───────────────────────┬─────────────────────┘
                           ▼
   ┌─────────────────────────────────────────────┐
   │  3. Pip replies: reflects, asks a soft        │
   │     question, holds space, or offers a        │
   │     short breathing / meditation moment       │
   └───────────────────────┬─────────────────────┘
                           ▼
   ┌─────────────────────────────────────────────┐
   │  4. Everything is quietly saved as entries    │
   └───────────────────────┬─────────────────────┘
                           ▼
   ┌─────────────────────────────────────────────┐
   │  5. End of day: AI synthesizes the day into   │
   │     a written memory + photo card             │
   └───────────────────────┬─────────────────────┘
                           ▼
   ┌─────────────────────────────────────────────┐
   │  6. User revisits the timeline: scrolls       │
   │     memories, photos, and mood over time      │
   └─────────────────────────────────────────────┘
```

## 8. Feature set

### P0 — MVP (required to win the bounty)

| Feature | What it does | Why it matters |
|---|---|---|
| Onboarding | Name, what brings you here, set nudge rhythm, meet Pip. Under 60s. | First impression + habit setup |
| The Thread | iMessage-style chat. Send text + photos. Pip replies via AI. | The whole product lives here |
| Frictionless capture | Every message saved as a timestamped entry with optional photo + auto mood/tag. | This is the journaling, hidden |
| Pip (AI companion) | Warm, non-clinical replies. Listens, reflects, asks gentle questions. | The reason it feels human |
| Daily synthesis | AI turns the day's messages + photos into a written memory + card. | Turns chatter into a keepsake |
| Memory timeline | Web view: browse past days, photos, entries, mood trend, search. | The payoff, the reason to stay |
| Gentle nudges | Soft morning + evening push notifications. | Rebuilds the habit without nagging |
| Paywall | Freemium gate + Stripe subscription checkout. | The finish line of the bounty |
| Auth + storage | Accounts, secure data + photo storage. | Table stakes |
| Safety layer | Crisis detection, disclaimers, resources, boundaries. | Non-negotiable, ethical + legal |

### P1 — Fast follow (after the paying customer)

- A few guided breathing / meditation flows (beyond text prompts).
- Weekly recap ("your week, in a card").
- Mood insights over time (simple charts).
- Export to PDF / print keepsake.
- Streaks and gentle milestones (careful, not gamified into pressure).

### P2 — Later

- SMS / MMS via Twilio (the true "text a number" version).
- Voice notes + transcription.
- Native iOS app.
- Themes / mascot outfits.
- Shareable memory cards.

## 9. Key user flows

**Onboarding**
1. Welcome screen: Pip introduces itself in one warm line.
2. "What should Pip call you?" (name).
3. "What brings you here?" (a few soft chips: processing a lot / building a habit / remembering my days / just curious). Used to warm up Pip's first message.
4. "When should Pip check in?" (morning + evening time pickers, skippable).
5. Notification permission (framed as "so Pip can gently check in," not "allow notifications").
6. Drop straight into the thread with a warm first message from Pip.

**Daily capture**
1. Nudge or self-open → thread.
2. User types / sends photo. Send is instant, optimistic UI, no "saving" friction.
3. Pip typing indicator → warm reply within a couple seconds.
4. Repeat any number of times through the day.

**Synthesis + revisit**
1. At the user's evening time (or on-demand), the day's entries are synthesized into a memory.
2. User gets a soft "your day is ready to look back on" moment.
3. Timeline shows the memory card: a short written reflection in the user's own voice, the day's photos, and a mood read.
4. User can open any past day, search, and scroll their story.

## 10. Monetization

The paying customer is a bounty requirement, so monetization is core, not an afterthought.

**Model:** Freemium with a subscription.

- **Free:** capture + basic thread + a limited look-back (for example, the last 7 days of timeline). Enough to feel the magic and get hooked.
- **Paid (Pip+):** unlimited Pip conversation depth, full daily synthesis, full memory timeline forever, search, export, and the richer meditations.

**Price:** recommend **$5.99–$7.99 / month**, or a **founder price of $4/month** for early users to make that first sale easy. Offer an annual option later. Keep the checkout dead simple (Stripe Checkout, one click).

**Getting the first paying customer:** you do not need scale, you need one. Ship, use it yourself for a few days so it is genuinely good, then put it in front of friends / a small community / the founder's audience with the founder price. The product has to earn the sale by being good, so polish the first-run experience above all.

## 11. Success metrics

For the bounty: **1 paying customer.** That is the metric that matters.

Health metrics to watch as you build (leading indicators the product works):
- Day-2 return rate (did they come back the day after signup).
- Messages per active day (are they actually talking to Pip).
- Percent of days that get synthesized and revisited.
- Free → paid conversion.

## 12. Risks and mitigations

| Risk | Mitigation |
|---|---|
| "iMessage" is impossible on Apple's platform | Build an iMessage-*style* chat UI in the PWA. Set expectations. SMS is a P2 future. |
| Mental-health safety (self-harm, crisis) | Hard safety layer: detection, disclaimers, region-appropriate resources, boundaries. Pip is explicitly not a therapist. See Design Spec. |
| Sensitive data (journals + photos) | Encryption, strict access control, export + delete, a real privacy policy, no training on user data. |
| Pip feels robotic and the magic dies | Invest in the companion prompt + voice guidelines. This is the product, not a feature. Test replies against the Do/Don't examples. |
| Retention (journaling apps churn hard) | The nudges + the growing timeline are the retention engine. The longer you use it, the more you have to lose. |
| AI cost per user | Use a cost-efficient model (Claude Sonnet tier) for most replies, cap message context, batch the daily synthesis. Watch token spend per active user. |
| Positioning as a medical / clinical product | Do not claim to treat or diagnose anything. Position as reflection + journaling. Keep marketing language careful. |

## 13. Timeline at a glance

Phased in `04-build-handoff.md`. Rough shape: setup → chat + capture → Pip replies + safety → synthesis + timeline → nudges + meditation → paywall → brand polish. Paywall must be reachable and working before you call it submittable.
