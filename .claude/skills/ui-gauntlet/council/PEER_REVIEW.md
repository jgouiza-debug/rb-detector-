# Peer round (anonymized)

Adversarial cross-checking. **Not** re-scoring from scratch, and explicitly not
consensus-building. A peer round that produces agreement has failed.

Run one peer per advisor where budget allows, minimum three, spread across model
families. Each peer receives all five advisor reports with names and personas
stripped, in randomised order, plus the screenshots and the gate report.

## Assigning peers

Give each peer a **beat** (source/system claims, taste and product claims, and
so on) and — this matters more than the beat — **name the specific contested
claims they must verify independently**. A peer told only "cross-check the
reports" returns opinion. A peer told "advisor 5 claims six distinct radii ship
against a three-rung ladder; count them yourself" returns a fact.

Contested claims are the ones where advisor scores diverge by 2+ points on one
criterion, or where a single advisor asserts something no one else saw. Those
are exactly the claims that are either the round's best find or its worst error,
and you cannot tell which without checking.

Tell peers not to defer to the orchestrator's own view of a contested claim.

## The job

1. **Falsify.** Verify the file:line and screenshot citations. Report any claim
   you can prove wrong. Check that cited files are that long and that quoted
   comments exist — a real finding attached to a misquote is still a misquote,
   and both should be reported.
2. **Inflation.** A score the advisor's own evidence does not support, or a
   defect described in prose but never reflected in the number.
3. **Deflation.** A dock that double-counts another criterion's defect, or that
   penalises something the rubric never asked for. Name which single criterion
   should carry a defect that appears under three.
4. **Blind spots.** A defect no advisor caught. Prioritise what is provable.

## Output (≤ 800 words)

```
## Falsified claims
advisor N, criterion — the claim — your evidence

## Inflation
criterion, from → to, why

## Deflation
criterion, from → to, why

## Blind spots
defect — file:line or screenshot+coordinate — which criterion carries it

## Recommended medians
B1–B5, C1–C4 with one evidence line each
```

Peers are read-only. No repo file is created or edited, including scratch files.
