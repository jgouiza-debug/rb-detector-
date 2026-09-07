# Pip — Design System & the Redesign, Law by Law

This is the "compare" document: what Pip looked like before the premium pass, the
UX laws that drove each change, and the concrete moves they became in code. The
brief was **luxury-forward with warmth as the undertone** — keep the single warmth
anchor (the Pip mascot), remove the *diffuse* warmth (decorative emoji, always-on
loud accents, cute-not-refined type), and add a "just speak" voice capture.

The visual before/after was delivered as phone screenshots in the build thread;
this doc is the rationale and the token reference behind them.

---

## The brief, before → after

| | Before | After |
|---|---|---|
| Accent | Saturated honey/sunlight fills everywhere (paywall gradient, nav pills, chips) | One confident honey accent, reserved for the primary action / active state |
| Emoji | ~30 decorative emoji across onboarding, toasts, timeline, push, and the model's own replies | Zero. A coherent lucide line-icon system; mood is carried by **color first**, icon second |
| Depth | Blanket `shadow-sm` | A three-step elevation ladder (`--elev-1/2/3`), warm-tinted and dark-aware |
| Type | Fredoka (rounded/cute) doing headings | Fraunces leaned on for the keepsake voice; Fredoka used sparingly; display headings tightened |
| Chrome | Thread boxed in — 3 top icons + a Thread/Timeline pill on the composer | Two quiet top icons; nav moved to the bar; composer stands alone |
| Voice | — | iOS-style "just speak" sheet: dictate → tidy offline → log a quiet note, no reply |

---

## Laws → moves

**Jakob's Law** (people expect your app to work like the ones they know) — Kept the
iMessage mental model: bubbles, a bottom-pinned composer, the send affordance on
the trailing edge. The mic *replaces* send when the field is empty (mic when
empty, arrow when typing) — exactly the iMessage pattern.
→ `components/chat/Composer.tsx`, `components/chat/Bubble.tsx`

**Hick's Law** (more choices = slower decisions) — The thread top bar went from
three icons to two; the global Thread/Timeline bottom nav was removed and folded
into the top bars. Onboarding stays one decision per step.
→ `components/chat/ThreadTopBar.tsx`, `components/timeline/TimelineTopBar.tsx`, `app/(app)/layout.tsx`

**Fitts's Law** (big, close targets are faster) — Primary actions are full-width in
the thumb zone; every tap target is ≥44px (`.tap`), matching Apple HIG.
→ `app/globals.css` (`.tap { min-width:44px; min-height:44px }`), `components/ui/Button.tsx`

**Miller's Law** (~7 items in working memory) — Pip replies in 1–3 short bubbles,
never a wall; the bubble parser caps at 3 and merges overflow.
→ `lib/ai/bubbles.ts`, the frozen `PIP_SYSTEM` prompt

**Tesler's Law / Postel's Law** (some complexity is irreducible; be liberal in what
you accept) — Voice capture accepts messy speech and cleans it *for* the user:
fillers stripped, stutters collapsed, casing and punctuation fixed — but never
rewriting real words ("i like this", "kind of blue" survive).
→ `lib/voice/tidy.ts`

**Von Restorff (isolation) + Aesthetic-Usability** (one thing stands out; pretty
reads as usable) — A single honey accent (`--cta`) is reserved for the primary
action and the active state; everything else is warm neutral (cream / ink /
surface). The saturated paywall gradient became a calm surface card with one
accent chip.
→ `components/timeline/PaywallCard.tsx`, `components/ui/Button.tsx`

**Goal-Gradient + Endowed Progress** (motivation rises near the goal; a head start
helps) — Onboarding draws an endowed progress bar: the welcome step counts as
done, so step one already reads ~40% and the bar fills to full on the final
decision.
→ `components/onboarding/StepShell.tsx`

**Peak-End Rule** (we remember the peak and the end) — Onboarding ends on a warm
first-entry moment (Pip speaks first, personalized); the voice capture ends on a
"logged quietly" micro-confirmation + a sparing haptic.
→ `lib/chat/opener.ts`, `components/chat/VoiceSheet.tsx`

**Doherty Threshold + Material motion** (keep feedback < 400ms) — Optimistic
bubbles and skeletons already; transitions are 200–400ms ease-out; the voice sheet
streams a live transcript over a waveform so feedback never stalls.
→ `lib/store/threadStore.ts`, `app/globals.css` (`--ease-soft`, `voicebar`)

**Gestalt (proximity / common region)** — The timeline groups by *whitespace*, not
lines: recent keepsakes sit tight together, then a generous gap and a quiet
"earlier" label before the compact cards.
→ `components/timeline/TimelineView.tsx`

**WCAG 2.2 + Apple HIG** — The "calm low-contrast" trap is guardrailed by a contrast
test (body ≥ 4.5:1, non-text ≥ 3:1) that runs in light *and* dark. `viewport-fit`
safe-area insets, `prefers-reduced-motion` honored on every animation, haptics are
progressive enhancement.
→ `lib/theme/contrast.ts` + `contrast.test`, `app/globals.css` (`.pt-safe`, reduced-motion block)

---

## Token reference (the systems added in the pass)

**Elevation** — soft, warm-tinted, low-opacity; depth should whisper. Dark mode
swaps to deeper, cooler shadows.

| Token | Light | Use |
|---|---|---|
| `--shadow-1` | `0 1px 2px /.04, 0 2px 8px /.05` | lift a primary (Button) |
| `--shadow-2` | `0 2px 6px /.06, 0 10px 28px /.07` | menus, pills, cards |
| `--shadow-3` | `0 10px 30px /.10, 0 28px 72px /.12` | sheets, modals |

**Radii** — tightened for a crisper read: `--radius-field 0.875rem`,
`--radius-bubble 1.125rem`, `--radius-card 1.25rem`, `--radius-pill 999px`.

**Type** — `--font-reading` Fraunces (keepsake voice), `--font-ui` Nunito Sans
(everything functional), `--font-display` Fredoka (used sparingly);
`.font-display` gets `letter-spacing: -0.012em` so headings read refined, not cute.

**Accent & surfaces** — accent `--cta` = `--honey` (`#f5b841`), reserved for
primary/active only. Neutral ladder `--bg` (cream) → `--surface` (#fff) →
`--surface-2` → `--surface-3`. Ring `--ring` = amber-ink (light) / sunlight (dark).

**Mood as color-first** — `lib/theme/tokens.ts` carries the color pairs (contrast-
tested); `lib/theme/moodIcons.ts` maps each mood to a lucide icon (Sun / Waves /
Cloud / Heart / Sprout / Contrast) as the *secondary* signal.

**Motion** — `--ease-spring`, `--ease-soft`; every `--animate-*` is disabled under
`prefers-reduced-motion` and scaled by `--motion-scale` (the pause screen slows
everything down).

---

## Voice "just speak" (the new flagship)

Mic on the composer's trailing edge → an iOS-style bottom sheet. On a supported
browser it dictates hands-free (Web Speech, on-device), streaming an interim
transcript over a live waveform; everywhere else it falls back to a keyboard
field (the same path the e2e drives). On save the transcript is tidied offline
(`lib/voice/tidy.ts`) and stored as a quiet `voice` note.

A voice note is **not** a conversation turn: it's captured, **always** run through
the safety gate, and saved with **no reply and no cap spend**. It stays out of the
live reply context (like a system note) but still counts toward the day, so
synthesis folds it into the keepsake. A spoken crisis still takes the full crisis
path — safety overrides "quiet".

Optional **bring-your-own-key** transcription is wired behind a clean port
(`lib/ports/transcription.ts`): an OpenAI-compatible server path used only when a
user stores their own key (server-side only, never returned to the client). The
offline Web Speech path is the default and needs no key.
