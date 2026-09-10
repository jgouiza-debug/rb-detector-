# Worked example — a mobile journalling app

The three files a project has to write, filled in for a real product. Read them
alongside `../../config.example.ts`, which is the annotated contract.

| File | What it is |
|---|---|
| `config.ts` | The whole project-specific surface: viewport, theme toggle, type limits, brand palette, sealed namespaces, budgets, doc paths, fixture/production adapters |
| `screens.ts` | The screen list. Ordered, because the run is one continuous session: an anonymous user walks through onboarding, seeds data, and later screens depend on that state |
| `taste-brief.md` | The subjective north star handed to the council — the feeling the product is aiming at, in the team's own words |

## What this example is actually worth

It ran nine rounds. The first jury, drawn from one model family, scored it 96.5.
A mixed jury re-judging the identical screenshots scored the same build 77.
Everything in the skill's guardrail table came out of that gap.

Some specifics worth copying:

**`screens.ts` carries `setup` functions, not just paths.** The interesting
defects live in states, not routes — a composer with a photo attached, a crisis
card mid-conversation, a locked day behind a paywall. A screen list of bare URLs
measures the easy half of an app.

**`thumbZone: false` is an honest exemption, not an escape hatch.** It marks
screens whose "primary action" is a navigation row rather than a CTA. The ≥44px
rule still applies. Reach for it twice and you are gaming the gate.

**The palette includes the dark half.** A palette with only light tokens reports
every dark screen as off-brand, and the noise trains everyone to ignore A4.

**`fixtureAdapters` is the entry that matters most.** This project's gate runs
offline, so every generated line of copy on every screenshot came from a
deterministic stub. Four advisors and a chair spent eight rounds critiquing that
stub's cadence as if it were the product's voice. The production adapter's
prompt already asked for the thing they kept requesting. Declare this honestly
or the council's Tier B/C judgement is aimed at a file that never ships.

## What the example gets wrong, deliberately left in

The screen list covers 15 of 24 routes. Preflight's `fixture-completeness` check
fails on this repo, loudly, and that is the point — it is what the check was
written to catch. Among the 12 unrendered routes is a terminal screen with zero
interactive elements that survived nine rounds of a council explicitly hunting
dead ends, and a settings route whose modal ships a third font family past a
type gate that passed every round.

Do not "fix" the example by widening `allowedDeadEnds`. That is the exact move
the guardrail exists to prevent.
