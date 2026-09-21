# Peer review — User & Brand Advocate

## 1. Ranking (best evidentiary quality first)

1. **Review B** — Most rigorous. Catches a real, verifiable bug the others miss: `StepShell.tsx:11,16` sets the visual fill to `(step+1)/(total+1)` but `aria-valuenow={step}` — I confirmed both lines in source; sighted and screen-reader progress genuinely disagree. Also traces `moodTokens` being theme-agnostic (dark-mode `mixed`/`heavy` chips outshining `bright`) and the radius namespace never being wiped like `--text-*` — systemic, line-cited findings.
2. **Review C** — Equally careful, and honest about its limits: flags `VoiceSheet`'s fake waveform (`animate-voicebar` with no `AnalyserNode` in `useDictation.ts`) and explicitly says "I did not verify... no speech engine in this environment." That epistemic honesty is worth more than it costs in confidence.
3. **Review A** — Solid, narrower scope (the `role="tablist"` misuse and the pacer's chatty `aria-live` are both real), but doesn't range as wide as B/C.
4. **Review D** — Good specific counts (radii, "kept" used 10+ times) but leans more editorial ("a Duolingo bounce, not a Stoic one") and its C3 reasoning never engages the memory-card repetition, the one moment my own review turned on.

## 2. Disputes

**Review C, C3: 5/6** — they cite the gated week milestone and `keepsake-in` as earned, but never check whether the reflection itself is real synthesis. `memory-card-light-full.jpg`: reflection = "Big review at work today, I was so nervous going in. I want to remember this one." vs. the entry directly below under WHAT I SAID, THAT DAY: "big review at work today, i was so nervous going in." Same sentence, recapitalized — confirmed against `scripted.ts` (`body.map(sentence)` + one canned `CLOSINGS` line). Design-spec §3.3 asks for 3–5 sentences of synthesis "drawn from what they actually said," not the sentence back verbatim. None of A/B/C/D caught this. I'd hold at 4/6, not 5.

**Reviews A/B/C/D, C1: all 6/7** — I had 5/7, stacking the meditation-pause over-ask and thread-crisis density as two separate -1s. All four peers independently found the same two issues but net only -1, treating the crisis density as spec-justified (region resources are required, the 988 pair dominates). I agree on rereading `thread-crisis-light.jpg` — the two 988 buttons are visually dominant and the row count is what the design spec asks for. Revising up.

**Reviews A/B/C/D, B3: 6/7** — I had 5/7, docked for "thin" screenshot proof. But B3 evidence here is code-level (optimistic send, real retry state, shaped skeletons, haptics) exactly like how axe/code evidence is treated as valid under A1 — I shouldn't apply a stricter standard here than I do elsewhere. Revising up.

## 3. Score changes

C1: 5→6. B3: 5→6. C3 unchanged (4), confirmed against `memory-card-light-full.jpg` and `scripted.ts`.

```json
{"revisedScores": {"C1": 6, "B3": 6}}
```
