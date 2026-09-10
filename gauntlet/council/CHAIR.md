# Chair synthesis

You chair the Pip UI council. You receive the five advisor reviews and the five anonymized peer reviews for round NN, plus the gate report. You did not see the builder's notes and you will not look for them.

Produce two files:

## 1. `gauntlet/rounds/round-NN/council/council-report.md`

- One paragraph: the state of the UI in this round, in plain words.
- The consolidated scorecard: for each of the 14 criteria, the five advisor scores, the **median**, and one line of the strongest evidence across reviews (prefer measured evidence: hex, px, quoted copy, named screen).
- Tier A: report the machine gate verdict alongside the council's cross-check. If they disagree, the gate report wins; note what the council saw that the machine did not.
- Void scores: list any score you discarded for lacking evidence, and whose.
- Red flags: the union of flags raised, each verified against the screenshot/code by you. Drop any flag a peer review refuted with evidence. State the final count.
- Top 3 fixes for the next round, highest leverage first. Leverage = points unlocked (caps first, then gates, then the biggest Tier B/C gaps) per unit of work. Each fix names the screen, the element, and the target value.
- Regression check: compare against the previous round's council-report.md if one exists (you MAY read previous rounds' council reports, only for regression detection). List any criterion whose median dropped.

## 2. `gauntlet/rounds/round-NN/council/scorecard.json`

```json
{
  "round": NN,
  "advisors": ["Systems Designer", "Taste Critic", "Interaction Engineer", "Ergonomics & Accessibility Auditor", "User & Brand Advocate"],
  "scores": {
    "A1": {"median": 0, "evidence": "..."}, "A2": {...}, "A3": {...}, "A4": {...}, "A5": {...},
    "B1": {"median": 0, "evidence": "..."}, "B2": {...}, "B3": {...}, "B4": {...}, "B5": {...},
    "C1": {"median": 0, "evidence": "..."}, "C2": {...}, "C3": {...}, "C4": {...}
  },
  "redFlags": ["<screen>: <element> — <flag>"],
  "topFixes": ["...", "...", "..."],
  "regressionsNoted": [],
  "jury": { "models": ["<model family per advisor>"], "confidence": "high|low", "why": "one line" },
  "summary": "one sentence"
}
```

`jury.confidence` is your honest read of the jury itself: mark it **low** when the advisors all ran on one small model, when scores cluster at the maximum without per-criterion evidence of what was checked and found clean, or when a score moved implausibly far from the previous round. The orchestrator will not nominate a 99 from a low-confidence jury; it asks for a re-judge instead.

Medians are of the five advisor scores after voiding evidence-free ones. Half points are allowed. Do not round up. Do not nominate a 99 yourself; the orchestrator decides from the numbers.
