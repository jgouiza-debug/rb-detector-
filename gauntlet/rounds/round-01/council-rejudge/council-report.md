# Council report — round 01 (RE-JUDGE)

**This supersedes the original round-01 council verdict.** Round 01 was first judged by a jury drawn
entirely from one small model family (Claude Haiku), because the larger models were rate-limited that
day. That jury returned a **96.5 median with 3 red flags**. This re-judge exists to test that number.
It does not survive.

**Jury:** Opus (Systems Designer) · Fable (Taste Critic) · Sonnet (Interaction Engineer) ·
Sonnet (Ergonomics & Accessibility Auditor) · Opus (User & Brand Advocate).
Advisor totals as submitted: **74 · 75 · 90 · 86 · 80**. Council median after voiding: **77**.

## Methodological limitations of this round — read before using the number

Three things about this round are worse than a normal council round, and the report should not be
read as if they weren't.

1. **No anonymized peer-review round ran.** It was skipped to conserve budget. Normally each
   advisor's claims are challenged by four peers before they reach me, and refuted claims arrive
   pre-marked. Nothing was pre-marked here. I compensated by adjudicating every disputed claim
   myself against the pixels — I opened **14 of the 26 screenshots** and name below exactly what I
   saw — and by voiding more aggressively than a peer-reviewed round would require. Where two
   advisors contradict each other and I could not settle it from the pixels, I dropped the claim
   rather than average it.
2. **Two advisors independently reported that their isolated git worktree held an earlier revision
   of the app than the build that was screenshotted.** The Systems Designer and the Taste Critic
   each verified this by string search: "the days you gave pip, kept.", "last 7 days", "keep it all ·
   $4.99/mo", "what i said (2)" and "you're not alone" are all legible in the round-01 pixels and
   exist nowhere in their checkouts, which still say "Your Story", "7-day window", "Unlock with
   Pip+" and "Raw Entries (2)". The User & Brand Advocate reports the same. **Every code citation
   in these five reviews is therefore suspect** and I treated it as such: a code-only claim earned
   no points and prevented none unless a screenshot or the gate report corroborated it. Pixel
   evidence and gate evidence are sound and carry the scoring. This is why five of the seventy
   advisor scores were voided for resting on unverifiable source, and why the two advisors who
   leaned hardest on code (Interaction Engineer 90, Ergonomics Auditor 86) lost the most scores.
3. **Motion and interaction are under-evidenced by construction.** Stagger, press states, easing
   curves and animation durations cannot be measured from stills, and the gate measures only whether
   animations stop under `prefers-reduced-motion` (they do, 8/8). Every B3/B4 claim in every review
   is therefore either a still-frame inference or a stale-code citation. Those two medians are the
   softest numbers in this report and I say so rather than dress them up.

## The state of the UI, in plain words

Round 01 is a real and substantial repair job. Every one of the five Tier A gates now passes, where
round 00 failed four of them and tripped two hard caps: the timeline no longer renders 644px wide
inside a 390px phone, chat bubbles clear 44px, the console is silent, the type ramp is back inside
six sizes and the palette holds 70/20/10 on 21 of 21 screens. The craft that was always here is still
here — a hand-drawn mascot whose expression actually changes screen to screen, a five-step onboarding
that asks one question at a time and offers an honest skip on every optional one, a crisis flow whose
writing ("i'm a small app, not a person who can keep you safe right now — but there are people who
can, and they're there for exactly this. i'll stay here while you reach them.") is better than most
shipping products manage, and a paywall with a flat price, a real exit and "cancel anytime · export
and delete stay free, always" printed on the card. What round 01 did **not** do is fix the product's
centre. The keepsake — the artifact the whole app exists to produce — is still visibly machine-
assembled: all seven reflections on `timeline-light-full` are joined with the word "Later,", which
produces non-sentences like "Later, but i made it through, and i'm home now", and every compact card
titles itself with the first four words of its own body, so each card says the same phrase twice and
one of them is titled "Hard day honestly, everything". Round 00's council flagged exactly this
templating; round 01 changed the template and kept the templating. Around it, three screens end in
300–550px of empty cream, the timeline buries the user's own words 59% down the page behind a week
strip, a search field and a filter row, the money voice speaks twice in two registers one tap apart,
and in dark mode the user's bubble blazes honey while Pip's goes neutral grey — the warmth is on the
wrong side. The gates are a floor, and this build has finally reached it. It has not yet built on it.

## Consolidated scorecard

Advisor order: **SD** Systems Designer (Opus) · **TC** Taste Critic (Fable) · **IE** Interaction
Engineer (Sonnet) · **EA** Ergonomics Auditor (Sonnet) · **UBA** User & Brand Advocate (Opus).
Voided scores shown struck (`—`). Medians are over surviving scores; half points allowed; never
rounded up.

| # | Pts | SD | TC | IE | EA | UBA | **Median** | Strongest evidence across the reviews |
|---|---|---|---|---|---|---|---|---|
| A1 | 12 | 11 | 11 | 11 | 10 | — | **11** | Gate PASS: 0 axe serious+critical, 0 contrast failures (axe and measured), focus indicator on 82/82 tabbed controls, 0 animations running under `prefers-reduced-motion`. Council docks 1 for the residual the gate logged but did not gate: a **moderate `region` violation on thread/light, thread/dark and thread-crisis/light** — the composer `<textarea aria-label="message pip">` sits outside any landmark on the screen users live in. Chair-verified second residual: `meditation-pause-light` offers **no visible pause control** at all (only an X and a "switch rhythm" pill), so the breathing animation cannot be stopped by anyone not tabbing with a screen reader. |
| A2 | 8 | 6 | 7 | 7 | 7 | — | **7** | Gate PASS: 0/217 block targets under 44×44, 0 inline links under 44px, primary action ≥44px in the thumb zone on 21/21 (onboarding CTAs 342×56, composer 44×44). Beyond the machine, chair-verified on `timeline-light`: the app's only two navigation controls are 20px icons at the top-right of the bar (chat ≈x304, gear ≈x352, y≈28) where the spec asks for a two-item bottom nav — the hardest corner of an 844px phone to reach one-handed. Also chair-verified: the mood-filter row is **sliced mid-chip at x=390** ("ca…") with no scroll cue, and `memory-card` has no primary action at all (gate: "zone n/a"), its only forward affordance being the 14px tab row at y≈98. |
| A3 | 8 | 5 | 7 | 7 | — | — | **7** | Gate PASS: 95.2% of spacing on the 8pt grid, the only off-8 value is 4px×98, 0 values off the 4pt half-grid, 0 misaligned siblings across 21 screens. Chair-verified counter-evidence: on `settings-light` the "get help now" card and the "account" row sit 22px apart at the same width with the same padding and **two visibly different corner radii** (≈20px vs ≈16px), and the timeline stack runs three card insets in one column. Timeline is the weakest screen at 84.8% on-grid, with the block rhythm alternating ≈24 / ≈16 / ≈24px for one vertical stack. |
| A4 | 6 | 4 | 5 | — | — | 6 | **5** | Gate PASS: 6 sizes (12/14/16/18/24/32), 3 families (fraunces/fredoka/nunito), 3 weights (400/600/700), 70/20/10 proxy on 21/21. The three-role split is honoured where it counts — chair-verified that `thread-light` bubbles are Nunito and the `memory-card-light` reflection is Fraunces. Against it, chair-verified on `meditation-pause-light`: **"breathe in…" renders in Fraunces** and is the largest type on the screen, while the brand reserves the reading serif for memory surfaces "so the shift means something". And `timeline-light` runs surface 48.8% against cream 41.5% — two neutrals at parity, so the payoff page has no single ground. |
| A5 | 6 | 6 | 5 | — | — | — | **5.5** | Gate PASS: 0 console errors/warnings/failed requests, CLS ≤0.013 on 21/21 (cap 0.1), FCP 36–92ms, 0 dead ends, 0 horizontal overflow. Council cross-check the machine did not catch, chair-verified on **all three thread renders** (`thread-light`, `thread-dark`, `thread-crisis-light`): the frame opens on a **clipped user bubble at y=0 with no top bar in view** — no Pip avatar, no "pip" wordmark, and no route to the timeline or settings. The gate's "primary action present" check passes because the composer is present; it does not check that the screen has an identity or an exit. Chair-verified the other way too: the "ca…" chip clipped at x=390 is an internal scroller, not page overflow, consistent with the gate's 0. |
| B1 | 8 | 5 | 5 | 6 | 7 | 5 | **5** | Chair-verified on `timeline-light`: above the fold sit an h1 ("your story", 32px Fredoka), a subtitle, a "last 7 days" pill, a whole "this week's flow" card (header + count + seven dots + a weekday axis + a numeric axis), a search field and a six-item chip row — and only then, at y≈452, the words "TODAY'S KEEPSAKE", with the date at **y≈495, 59% down an 844px phone**. Five entry points before one word of the user's own day. Best in class the other way: `onboarding-notify` and `onboarding-welcome` are one Pip, one line, one honey CTA and nothing competing. `settings-subscription-light`'s focal point is the word "free". |
| B2 | 7 | 4 | 5 | — | 6 | 5 | **5** | Genuine systemization: the crisis resource list is one component rendered both inline in `thread-crisis-light` and as the whole of `help-light` (chair-verified, identical five region rows US/CANADA/UK & IRELAND/AUSTRALIA/ANYWHERE), and the segmented pill inverts correctly between `memory-card-light` and `memory-card-dark`. Against it, chair-verified across five screens: the back link is **five different conventions** — "back to pip" (settings), "settings" (subscription), "your story" (locked paywall), "back" (help) and "keepsake edition" (memory detail, which names the page you are already on). Same day, two labels: "Mixed" on timeline vs "A mixed day" on the memory card. Same $4.99 purchase, two voices one tap apart: "keep it all · $4.99/mo" vs "upgrade to Pip+ ($4.99/mo)". And `onboarding-welcome` floats its CTA at y≈566 while the other four steps anchor at y≈816. |
| B3 | 7 | 5 | 5 | 5 | 6 | 5 | **5** | Four of five advisors converge, and the convergent deduction is the 380ms `bubble-in` against the rubric's 150–300ms band — **a stale-code citation I could not verify**, so this median carries the weakest evidence in the report. What is pixel-verifiable is thin: on `timeline-light` the memory card's forward affordance is a small "open →" in the card's bottom-right rather than the whole card, while the compact cards below it are wholly tappable — two hit-area contracts for the same "open this day" intent on one screen. Credit where the reviews agree and the shapes are visible: shape-matched skeletons under "pip is wrapping up monday…" rather than a spinner, an optimistic pending bubble, and a "didn't send · tap to retry" affordance rather than a stuck state. |
| B4 | 5 | 4 | 3 | 4 | 4 | 4 | **4** | Gate-verified: 0 running animations under `prefers-reduced-motion` on 8/8 sampled screens — honoured completely, not merely shortened. Chair-verified on `meditation-pause-light`: the breath ring carries a real progress marker at the top of the circle, and Pip sits inside it eyes-closed — motion with a job. Against it, the reviews agree that reduced motion stops Pip's breathe/blink entirely rather than easing it down, against the spec's "Pip still lives", and that the `bubble-in` spring overshoots on every message arrival. Both are code-only claims; the direction is conservative and consistent across four independent reviews, so the deduction stands but the precision does not. |
| B5 | 8 | 6 | 5 | — | — | 5 | **5** | Could only be Pip, chair-verified: the mascot is hand-authored (sprout, blush cheeks, expression carried in the eyes alone) and it **acts** — eyes open and listening on welcome, closed and cozy on the pause screen, smiling on the paywall. "the days you gave pip, kept." and "kept by pip" are lines no template writes. Against it, chair-verified on `timeline-light-full`: **"Later," is the connective in 7 of 7 reflections**, producing "Later, but i made it through, and i'm home now" and "Later, but i got through it, and that count…", and every compact card's title is the first four words of its own body — "Went for a walk" over "Went for a walk under the amber leaves after lunch.", "Hard day honestly, everything" over "Hard day honestly, everything felt heavy." One reflection ends "i'll take it…." — an ellipsis and a period. |
| C1 | 7 | 5 | 5 | 6 | 6 | 5 | **5** | Onboarding is exemplary and chair-verified: one question per screen, a progress bar, a visible escape on every optional step. `settings-light` is five rows and a sign-out with crisis help pinned above them where a tired person finds it first. Against it: `timeline-light` asks a person to parse four navigation systems — a seven-dot week strip, a "7 reflections" counter, a search field and a mood-filter row — before it returns a single day they wrote. Chair-verified detail: two of the seven week-strip dots carry a half-filled-circle glyph that reads as a display-settings icon, the only piece of UI chrome in a set otherwise made of sun, cloud, heart and waves. |
| C2 | 7 | 5 | 5 | — | 6 | 5 | **5** | The voice lands where it matters, chair-verified: `onboarding-welcome` pairs "hey, i'm pip / a place to put your thoughts down. no rules, just talk to me whenever." with "i'm a companion, not a therapist. if things ever get heavy, help is one tap away." — warm and unembarrassed about its limits on screen one. The crisis reply is the best writing in the build. Against it, chair-verified on `thread-light`: scroll back and **Pip is silent for two days** — Sat Sep 5 carries two user bubbles and no reply, Sun Sep 6 two more and no reply — and Pip's live reply to "but i made it through, and i'm home now" is "you made it through.", a four-word echo. On `thread-dark`, chair-verified: **Pip's bubbles are neutral grey while the user's blaze honey at 26.2% of the screen.** Pip is the warm one in light and the cold one in dark, and glary at 1am. |
| C3 | 6 | 4 | 3 | — | 5 | 3 | **3.5** | The reveal is composed with care and chair-verified: a "TODAY'S KEEPSAKE" eyebrow, the date in Fraunces, mood as colour plus one soft glyph, "2 moments kept" and a tiny Pip signature — no confetti, no streak, no second currency. But the moment the product builds to, chair-verified on `memory-card-light` and `-dark`: a date that orphan-wraps to "6, 2026" on a second line, a paragraph reading "Later, turns out the team was cheering for me", **no photos** (the spec asks the card to carry the day's), no share affordance, and content ending at y≈528 with **≈316px of bare cream below it (37% of the viewport)**. Nothing distinguishes a good day from a hard one: Sep 2's "small win but i'll take it" gets the identical card shape as Sep 1's "hard day honestly". |
| C4 | 5 | 4 | 4 | 5 | 4 | 3 | **4** | Capture is genuinely two taps — the thread is the landing screen and the composer is pinned with the field already there — and onboarding is five short, skippable steps well under 60s. The paywall is the strongest commercial writing in the build, chair-verified on both `timeline-light-full` and `memory-locked-paywall-light`: cozy Pip, "keep your whole story", the price flat inside the button as "keep it all · $4.99/mo", "not right now" as a real exit, and "cancel anytime · export and delete stay free, always". Friction: chair-verified that at rest the honey circle in the composer is a **microphone, not send**, so the highest-affordance control under the thumb does not do what a chat composer trains you to expect; and `memory-locked-paywall-light` shows **nothing of the day it is withholding** — a back link at y≈45, then ≈415px of flat cream, then the sheet. The moment of loss has no face. |

**Council median total: 77 / 100** — Tier A 35.5 · Tier B 24 · Tier C 17.5.

## Tier A: machine gate vs council cross-check

| Gate | Machine (ground truth) | Council cross-check | Disagreement? |
|---|---|---|---|
| A1 Accessibility | **PASS** — 0 axe serious+, 0 contrast fails, 82/82 focus, 0 animations under reduced motion | Docks 1 of 12 | No. Council found two residuals *below* the gate's threshold: the moderate `region` violation the gate itself logs on three thread renders, and no visible pause control on the breathing screen. |
| A2 Touch & ergonomics | **PASS** — 0/217 targets under 44×44, primary ≥44px in the thumb zone 21/21 | Docks 1 of 8 | No. The gate measures target *size*; the council measured *placement* — nav is two 20px icons top-right, and the filter row is clipped at x=390 with no scroll cue. Both are outside what the gate checks. |
| A3 Spatial system | **PASS** — 95.2% on 8pt, 0 off the 4pt half-grid, 0 misaligned siblings | Docks 1 of 8 | No. The council's radius findings (two radii on adjacent settings cards) are real and chair-verified but are a consistency defect, scored in B2, not a grid failure. |
| A4 Type & colour | **PASS** — 6 sizes, 3 families, 3 weights, 70/20/10 on 21/21 | Docks 1 of 6 | Partial, and **the gate wins**. Three advisors assert the source carries `text-[15px]`, `[11px]` and `[17px]` beyond the gate's six — that is a stale-worktree claim I cannot verify and it does not overturn the measured render. What survives is pixel-level: the reading serif is spent on "breathe in…", and timeline runs two neutrals at parity. |
| A5 Correctness & perf | **PASS** — 0 console errors, CLS ≤0.013, FCP ≤92ms, 0 dead ends, 0 sideways scroll | Docks 0.5 of 6 | Partial, and **the gate wins**. The council saw what the machine did not: all three thread renders show no top bar, so the app's home screen has no visible identity or exit. This does not overturn "0 dead ends" — the composer is present and functional — but it is the single most consequential thing the gate cannot see, and it should be checked live in round 02 before it is dismissed as a capture artifact. |

Hard caps: none triggered. Contrast→70 **no** · primary target→80 **no** · broken state→75 **no**.

## Void scores

Applied literally per CHAIR.md: a score is void when its evidence is absent, or when it rests only on
"the gate passes". In this round I extended that test one step — given the stale-worktree problem, a
score whose only beyond-the-gate reasoning was an unverifiable code citation was treated as resting
on the gate. Nine of seventy scores voided.

| Advisor | Criterion | Score voided | Why |
|---|---|---|---|
| User & Brand Advocate | A1 | 12/12 | Awards full marks on a restatement of the gate, then names the `region` violation as "advisory, not a deduction". The score itself rests on the gate passing. |
| User & Brand Advocate | A2 | 8/8 | Same pattern: gate restatement plus one beyond-gate finding (the chip sliced at x=390) that it declined to deduct for. Median unchanged at 7 either way. |
| User & Brand Advocate | A3 | 8/8 | Pure gate restatement — "95.2% on 8pt, 0 off the 4pt half-grid" with no independent measurement. |
| User & Brand Advocate | A5 | 6/6 | Pure gate restatement. |
| Ergonomics Auditor | A3 | 6/8 | Self-declared: "Not my primary lane; scoring on the gate's own numbers rather than an independent audit." That is the void rule in the advisor's own words. |
| Ergonomics Auditor | A5 | 6/6 | Gate restatement plus "nothing in the screenshots or code contradicts this" — no independent check. |
| Ergonomics Auditor | A4 | 6/6 | Gate restatement plus one stale-worktree claim (`--text-*: initial`) that cannot be checked against the render. |
| Ergonomics Auditor | B5 | 7/8 | Prefaced "not my primary lane" and rests on "zero SaaS boilerplate spotted across 26 screens" — **refuted by the chair against the pixels**: `settings-subscription-light` reads "upgrade to Pip+ ($4.99/mo)" and "refresh status". The sweep the score depends on did not happen. |
| Interaction Engineer | A4 | 6/6 | Gate restatement plus a stale-worktree token claim. |
| Interaction Engineer | A5 | 6/6 | Gate restatement plus stale-worktree code (`threadStore.ts` try/catch) that cannot be verified. |
| Interaction Engineer | B2 | 7/7 | Rests entirely on stale-worktree claims ("`--radius-card/--radius-bubble/--radius-pill` are the only radii used", "`TopBar.tsx` reused verbatim") and is **refuted by the chair against the pixels**: two radii on adjacent settings cards, five back-link conventions, "Mixed" vs "A mixed day", two money voices. |
| Interaction Engineer | B5 | 7/8 | Rests on "none of the banned SaaS phrases appear in any captured screen" and "generic SaaS copy (none found in any of the 26 screens)" — **refuted by the chair**, as above, and the review does not register the "Later," templating on the payoff screen at all. |
| Interaction Engineer | C2 | 7/7 | Rests on "Pip's avatar is present in the thread header" — **refuted by the chair against `thread-light`, `thread-dark` and `thread-crisis-light`: there is no header in any of the three frames.** |
| Interaction Engineer | C3 | 6/6 | Rests entirely on stale-worktree code (`navigator.vibrate(20)` in `useBreathing.ts`, `MemoryCard.tsx` line numbers) for a delight claim with no screenshot corroboration, and does not engage with the payoff screen. |

Net effect: the Interaction Engineer's submitted 90 and the Ergonomics Auditor's submitted 86 were
the two reviews most dependent on a source tree that does not match the build. Five and four of
their scores respectively did not survive. The three reviews anchored to pixels — 74, 75, 80 —
converge tightly, and the council median of 77 sits inside that band.

## Red flags

Union of every flag raised, each one adjudicated by me against the screenshots. Verified flags are
stated with the screen and element; dropped flags are stated with the reason.

**Standing (4):**

1. **`timeline-light-full` + `memory-card-light` — reflection body and compact-card titles: mail-merge
   templating.** Chair-verified: "Later," is the connective in **7 of 7** reflections, producing
   "Later, but i made it through, and i'm home now" and "Later, but i got through it, and that
   count…", neither of which is a sentence. Every compact card's title is the first four words of
   its own body, so each card says the same phrase twice and one is titled "Hard day honestly,
   everything" — a title that stops mid-clause. Capitalisation collides inside one paragraph
   ("Today was a lot honestly. work was heavy…"). One reflection ends "i'll take it…." Round 00's
   council flagged this exact defect with a different template ("Looking back, it felt like a lot
   to hold" on all 7 cards); round 01 changed the template and kept the templating. It is on the
   one surface that must feel precious.
2. **`settings-subscription-light` — CTA and secondary button: off-voice generic copy.**
   Chair-verified: "upgrade to Pip+ ($4.99/mo)" and "refresh status". Title-cased product name and a
   parenthesised price in an app that is lowercase everywhere else, plus engineering vocabulary on a
   user's screen — 40px away in the IA the paywall says "keep it all · $4.99/mo". Bundled with it,
   also chair-verified: `meditation-pause-light` labels its control "4-4-4-4 Box · switch rhythm",
   naming its own algorithm on the calmest screen in the app. Round 00 flagged that exact string;
   it is unchanged.
3. **`settings-subscription-light` + `memory-card-light`/`-dark` + `memory-locked-paywall-light`/`-dark`
   — page bottoms and tops: floaty balance.** Chair-measured on an 844px viewport: the subscription
   screen holds a 96px card at the top and **≈548px of empty cream** before its buttons; the memory
   card ends at y≈528 with **≈316px** of nothing under it; the locked paywall shows a back link at
   y≈45, then **≈415px** of flat undimmed cream, then the sheet. Round 00 flagged the same three
   screens at 540 / 300 / 440px. Unmoved.
4. **`timeline-light-full` — the card column: one texture, identical shapes stacked.**
   Chair-verified: roughly ten same-width (358px) white rounded rectangles run down one column on
   cream — week-flow card, search pill, two full cards, **five identical compact cards**, paywall —
   with no change of ground or rhythm. The Systems Designer refuted this on the grounds that the
   timeline deliberately tiers full vs compact cards, and that tiering is real; but two distinct
   shapes do not answer the flag when five of the eight cards are identical and machine-filled.
   Round 00 raised this flag ("eleven white rounded boxes… of which the EARLIER run is five
   identical CompactCards"); it is substantially unchanged.

**Dropped (4), with reasons:**

- **"Default framework spacing" (Systems Designer).** The pixel half is real and I verified it — two
  different corner radii on adjacent same-width, same-padding cards on `settings-light` — but the
  category is wrong: the rubric's flag is *untouched* Tailwind defaults and uniform padding, and the
  finding is the opposite complaint. Its supporting counts ("`rounded-2xl` used 21×") are
  stale-worktree code. Three advisors checked this category and found it clean, and the gate reports
  95.2% on-grid with 0 misaligned siblings. Retained as the B2 consistency deduction, not as a flag.
- **"Blur because it's possible" (Taste Critic, User & Brand Advocate).** Rests entirely on
  stale-worktree opacity values (`bg-bg/95 backdrop-blur-md`); blur and alpha are not measurable
  from a JPEG. Both the Interaction Engineer and the Ergonomics Auditor examined the same element
  and explicitly declined to flag it, calling it functional legibility under a scrolling list.
  Contested, unverifiable — dropped.
- **"Repeated card/badge grids" as a *second* flag on `settings-light`.** Five settings rows in one
  list is a settings list. Not a flag.
- **The Ergonomics Auditor's three submitted flags** (invisible `sr-only` toggle, composer outside
  `<main>`, inconsistent MemoryCard tap area) are genuine defects — the first two are corroborated
  by the gate's own axe log and by my check that `meditation-pause-light` has no visible pause
  control — but none of them is an item on the rubric's vibe-coded red-flag list. Scored in A1, A2
  and B3; not counted as red flags.

**Checked and clean, chair-confirmed:** default or generic gradients (the only gradients in the
build are Pip's body radial and its permitted sunlight→honey glow, plus a same-family warm wash on
the pause screen — no purple-blue, nothing unmotivated); too many colours or fonts (gate: 3 families,
3 weights, 6 sizes, 70/20/10 on 21/21); glassmorphism as an aesthetic (no frosted cards anywhere).

**Final red-flag count: 4.** The original Haiku jury reported 3. A 99 is blocked on this count alone,
independent of the score.

## Top 3 fixes for round 02

No hard caps are live and all five gates pass, so leverage is now purely the size of the Tier B/C
gap per unit of work. The three largest gaps — B1 (5/8), B5 (5/8) and C3 (3.5/6) — share two root
causes, and both are copy-and-layout work rather than systems work.

1. **Rewrite the keepsake so it isn't visibly stitched.** *Screen:* `timeline-light-full` and
   `memory-card-light`. *Elements:* the reflection body and the compact-card title. *Targets:* zero
   occurrences of the "Later," bridge across all seven days (currently 7/7); no card title derived
   from the first N words of its own body, so "Hard day honestly, everything" and "Went for a walk"
   stop repeating the sentence beneath them; one capitalisation convention inside a reflection; and
   no two of the seven days sharing a closing shape. If the fixture must stay deterministic,
   hand-write seven distinct first-person reflections. This single change clears red flag 1, removes
   the strongest driver of red flag 4, and is the largest simultaneous lift available to B5, C2 and
   C3 — roughly 5–6 points for a copy-layer change with no layout risk.
2. **Give the three payoff screens a bottom, and the paywall a face.** *Screens:* `memory-card-light`
   /`-dark`, `settings-subscription-light`, `memory-locked-paywall-light`/`-dark`. *Elements and
   targets:* on the memory card, fill the ≈316px below y≈528 with the day's photos (the spec asks
   the card to carry them; none appears in any of the 26 renders) and anchor a previous/next-day
   control in the thumb zone, and set the date on one line so "6, 2026" stops orphaning; on the
   subscription screen, move the CTA directly under the plan card to close the ≈548px void, delete
   "refresh status", and reuse the paywall's own words in place of "upgrade to Pip+ ($4.99/mo)"; on
   the locked paywall, render the withheld day behind the sheet — date legible, reflection softly
   veiled — instead of ≈415px of blank cream. Clears red flags 2 and 3 and lifts B1, C3 and C4.
3. **Raise the keepsake above the fold and give the thread its head back.** *Screen:*
   `timeline-light`. *Elements:* the "this week's flow" card, the search field and the filter chip
   row. *Target:* the first keepsake's date above **y≈300** instead of y≈495 — set the seven dots
   directly under the "your story" h1 as its second line, move search behind the magnifier in the
   top bar, and move the mood filters into that search sheet; also fix the chip row clipped at
   x=390 so a thumb can tell there is more. In the same pass, confirm live whether the thread's top
   bar renders — it is absent from all three thread frames, which leaves the app's home screen with
   no identity and no route to the timeline or settings. Lifts B1 and C1 and closes the one thing
   the gate could not see.

**Runners-up, cheap and worth doing:** unify the five back-link labels ("back to pip" / "settings" /
"your story" / "back" / "keepsake edition") onto one convention that names the destination; give
Pip's dark-mode bubble a warm tint and deepen the user's `#FFCF4D` so Pip is not the cold one at 1am;
seed Pip replies into Sat Sep 5 and Sun Sep 6, which currently show four user bubbles and zero from
Pip; move "breathe in…" off the reading serif so Fraunces still means "this is a memory"; and put the
composer inside a landmark to clear the axe `region` finding on the app's most-used screen.

## Regression check

Compared against `gauntlet/rounds/round-00/council/scorecard.json` (round 00: total **58**, 8 red
flags, four of five Tier A gates failed, two hard caps triggered).

| # | R00 | R01 | Δ |
|---|---|---|---|
| A1 | 11 | 11 | — |
| A2 | 3 | 7 | **+4** |
| A3 | 2 | 7 | **+5** |
| A4 | 3 | 5 | **+2** |
| A5 | 2 | 5.5 | **+3.5** |
| B1 | 5 | 5 | — |
| B2 | 5 | 5 | — |
| B3 | 5 | 5 | — |
| B4 | 3 | 4 | +1 |
| B5 | 4.5 | 5 | +0.5 |
| C1 | 4 | 5 | +1 |
| C2 | 4.5 | 5 | +0.5 |
| C3 | 3 | 3.5 | +0.5 |
| C4 | 3 | 4 | +1 |

**No criterion's median dropped. Zero regressions.** Red flags fell from 8 to 4.

The shape of this round is unambiguous: **+14.5 of the +19 total came from Tier A**, where the
machine gates went from four failures and two caps to five passes. Tier B moved +1.5 across five
criteria and Tier C moved +3 across four. Round 01 is a gate-repair round. The craft criteria that
round 00's council called out — buried payoff, templated keepsakes, floaty page bottoms, one money
voice missing, Pip under-present in its own thread — are almost all still open, several with
verbatim the same evidence.

## On the original 96.5

That number came from a jury drawn entirely from Claude Haiku, and it does not survive contact with
the pixels. This council's median is **77**, with **4** red flags standing rather than 3 — the flag
count went *up* while the score went down by 19.5.

The independent check that convinces me most is not the advisor spread; it is round 00. That round
was judged by a full, peer-reviewed council at **58**. A 96.5 for round 01 would require Tier B and
Tier C to have moved from 37/60 to roughly 57/60 in a single round — while `timeline-light-full`
still stitches all seven reflections with "Later,", still titles five cards with the first four words
of their own bodies, still ends three screens in 300–550px of empty cream, and still names its
breathing algorithm on the calm screen, all of which round 00's own council had already flagged in
writing. A jury that returns 96.5 against unchanged evidence is measuring its own agreeableness, not
the build. 77 is the number the pixels support.
