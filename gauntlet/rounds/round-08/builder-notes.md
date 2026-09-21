# Builder notes — round 8 (private to the builder; the council must not read this)

Not a council fix. The product owner asked for a full type rework: they disliked
all three faces and chose an editorial, grown-up direction.

## What changed

Three families became two.

| Role | Was | Now |
|---|---|---|
| Display / headings / wordmark | Fredoka (rounded sans) | **Newsreader** |
| UI / body | Nunito Sans | **Inter** |
| Journal / reading | Fraunces | **Newsreader** |

Newsreader is an editorial serif drawn for reading on screen. It carries every
heading *and* the whole keepsake surface, on the reasoning that a heading and a
memory are the same voice at different volumes — so the "this is precious, slow
down" shift the brand book asks for now comes from size, measure and ground
rather than from swapping typeface. Inter does the functional work at small
sizes without asking to be noticed.

The rounded display face was the thing making this app read juvenile rather than
warm. Warmth now comes from where it should: the cream, the honey, Pip, and the
spacing. Letterforms stopped trying to do that job.

Details: `font-optical-sizing: auto` so the serif changes shape between a 32px
heading and a 17px paragraph; display tracking relaxed from -0.012em (which
existed to tighten Fredoka) to -0.005em; Inter given -0.006em because its default
tracking is loose for UI at these sizes; the top-bar wordmark keeps a tighter
track so "pip" reads as a masthead rather than as small serif chrome.

## Two things worth flagging

**The brand book was updated, not ignored.** `docs/handoff/02-brand-guidelines.md`
§7 is the council's source of truth. Leaving it describing Fredoka/Nunito/Fraunces
would have had every advisor correctly flag the app for violating its own brand.
The doc now describes the two-family system and says why.

**The family gate tightened, 3 → 2.** It was 3 only because the brand ran a
three-role system; the rubric's own bar is 2. Removing the exception is a
tightening, and it is the opposite direction from the palette change in round 7 —
worth noting so the two are not confused with each other.

## Cost to the loop

Round 7's five advisors were mid-read when this started and could not be stopped
(they are subagents, not shell tasks). Their code citations refer to a type
system that no longer exists, so **round 7's council is discarded** rather than
scored. The screenshots and gate report for round 7 stand as a record; the
verdict does not. Round 8 is judged fresh.

## Known debt
- Radius drift persists (`rounded-xl`, `rounded-3xl` beside `rounded-card`).
- Timeline navigation still lives only in the top bar.
- The scripted reflection is still a tidy of the source, not a synthesis.
- Newsreader's italic is loaded but currently unused; keep or drop next round.
