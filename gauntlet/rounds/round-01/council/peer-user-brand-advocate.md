# Peer review — User & Brand Advocate

## Ranking (evidentiary quality, best first)

**Review C.** Specific, code-referenced, catches false confidence. Flags timeline hierarchy, paywall vagueness ("go deeper"), and missing milestone celebrations with screenshot evidence. Cites globals.css line 158 for glow animation concern, verifies contrast math, tests screen-reader nav. Lowest scores where evidence thins (C2, C3). This is rigorous.

**Review B.** Thorough and catches friction others miss (manual synthesis trigger, settings grouping, warmth in copy). Strong on micro-interactions detail (380ms spring, 320ms fade-up, 1.2s typing dots) but assumes animation perfection without testing. Flags valid hierarchy risk on timeline. 5/6 on C3 suggests healthy skepticism on invisible celebration moments.

**Review D.** Comprehensive baseline: every gate passes, brand taste is strong. But B5 at 8/8 and C3 at 6/6 feel confident without naming what's NOT visible (empty states, milestone celebrations). Recommends "thread avatar breathing animation" as a fix, suggesting the current app lacks idle presence. Fewer disputes means less critical eye.

**Review A.** Clean and confident but misses the timeline hierarchy issue entirely. B1 at 8/8 contradicts my own 7/8 and Reviews B/C's 7/8; the mood dots and "this week's flow" label in timeline-light screenshot DO compete with "your story" heading. Also gives B5 at 7/8 without naming the paywall "go deeper" weakness that Review C flags correctly per brand guidelines §11.

---

## Disputes (5 concrete issues)

**Review A, B1: 8/8 claim unsupported by timeline-light screenshot.** A says "No competing elements at same size" but timeline-light shows: "your story" (32px heading, text-fg), "this week's flow" (14px label), and seven mood emojis in saturated colors (24px visual weight). The emoji dots pull the eye before hierarchy settles. My 7/8 with fix proposal ("reduce mood dot saturation 10–15%") is screenshot-grounded; A's 8/8 misses this. *I would score 7/8.*

**Review B, B3: 8/8 claim requires animation testing not provided.** B details code timings (380ms spring, 320ms fade-up, 1.2s typing) but static screenshots can't verify animations run as coded. Review C flagged "no visual feedback on 'i feel ready' button press beyond scale-95," suggesting the micro-interaction story has gaps. B's 8/8 is confident without animation video evidence. *I would score 7/8.*

**Review C vs. my B5: C's 6/8 is correct, mine was generous.** C cites paywall "go deeper with you" as vague wellness-speak (brand guidelines §11: "Don't sound like a wellness startup"). Checking against 02-brand-guidelines.md §10 voice table: this phrase violates "warm, never clinical" and risks "fake-deep." I scored 8/8 without flagging this copy weakness. *I revise to 7/8.*

**Review C, C2: 5/7 correctly flags missing paywall warmth cue.** C notes "Paywall frame lacks Pip presence or warmth cue (just mascot icon at top, copy is honest but transactional)." Timeline-light-full screenshot shows paywall with Pip face but no active warmth (no cozy expression visible, no personalized Pip message like "keep it all" pitch per brand "listen first"). Empty states also not visible for verification. My 7/7 and A's 7/7 assume full evidence we can't verify from screenshots. *I revise to 6/7.*

**Review B & C, C3: Missing milestone celebration visible in screenshots.** Timeline-light screenshot shows memory cards but no celebration moment when "first week is full" or "first memory lands" (promised in brand guidelines §9: "the daily 'your memory is ready' moment gets a small, warm reveal"). B and C both score 5/6 for this gap. My 6/6 assumes it's implemented in code despite no screenshot evidence. *I revise to 5/6.*

---

## No changes to other scores

B1 remains 7/8 (hierarchy issue is real), B4 remains 5/5 (motion is purposeful and calm), C1 remains 7/7 (one action per screen, progressive disclosure holds), C4 remains 5/5 (core loop is effortless, paywall tone matches). All Tier A gates pass cleanly per gate report — no dispute there.

---

## Observation

Reviews B, C, and D all scored lower on criteria where evidence is harder to verify from static screenshots (animations, empty states, milestone moments, paywall warmth). Review A's higher scores often assume implementation without screenshot confirmation. Review C's lower scores are more conservative and evidence-grounded — the right stance for a council review working from screenshots and gate report only.

```json
{"revisedScores":{"B5":7,"C2":6,"C3":5}}
```
