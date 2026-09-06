# Safety & privacy

Pip touches people's hardest feelings. This is not optional and not bolted on.

## Pip is not a therapist

The welcome screen and the About page state plainly that Pip is a companion for reflection, not a mental-health professional or crisis service. Pip never diagnoses and never gives medical or medication advice. A "get help now" entry point is always reachable (a persistent button in the thread top bar and a public `/help` page that works even when signed out and offline).

## Crisis detection (three nets)

Runs on every user message, after the message is safely captured:

1. **Tier 1 — explicit keywords** (with misspellings and negation handling): direct signals of suicide, self-harm, or danger. Immediate crisis response, no model call.
2. **Tier 2 — ambiguous phrases** → a model intent check with a 6-second timeout. The model can only *raise* the verdict, never lower a keyword hit. **Any error or timeout is treated as crisis** (fail-safe).
3. **Tier 3 — soft distress** → a gentler companion tone (care mode), no crisis card.

Figurative language ("this deadline is killing me", "my phone died") is explicitly tested to stay "none".

## Crisis response

Human-written, never model-generated: calm warmth, honesty about limits, and real resources with tap-to-call/text links — 988 (call or text, US & Canada), Crisis Text Line, Samaritans (UK & Ireland), Lifeline (Australia), findahelpline.com, and the local emergency number. Care mode stays on for 24 hours, softening the companion and keeping flagged messages out of the day's synthesis.

`safety_events` records the tier, verdict, and source only — **never the message text** — and is purged after 90 days.

## Privacy

- **In transit:** TLS. **At rest:** the provider's AES-256 (Supabase Postgres and Storage).
- **Photos** live in a private bucket and are only ever served through an authenticated, ownership-checked proxy; the browser never receives a storage URL. EXIF/GPS is stripped server-side.
- **Row-level security** scopes every table to its owner; writes go through the server's service connection.
- **No analytics.** The Anthropic API does not train on inputs.
- **Export** (free for everyone) produces a complete zip of messages, memories, and photos. **Delete** (free for everyone) removes every row across all tables, all photos, and the auth user.
- We do not claim end-to-end encryption, because it isn't. The About page says exactly what is true.
