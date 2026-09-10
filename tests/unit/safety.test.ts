import { describe, expect, it, vi } from "vitest";
import { evaluateSafety } from "@/lib/safety/gate";
import { FIGURATIVE_SAFE } from "@/lib/safety/keywords";
import type { AiPort, RiskVerdict } from "@/lib/ports/ai";

function fakeAi(verdict: RiskVerdict | "throw", spy?: () => void): AiPort {
  return {
    reply: async function* () {},
    async classifyRisk() {
      spy?.();
      if (verdict === "throw") throw new Error("boom");
      return verdict;
    },
    async captionPhoto() {
      return null;
    },
    async synthesizeDay() {
      return null;
    },
  };
}

// A classifier that says "none" for everything. Under the new gate this IS
// consulted for every non-tier-1 message, so it stands in for "the model saw
// nothing" rather than "the model was never asked".
const modelSeesNothing = fakeAi({ risk: "none", confidence: 1, reason: "nothing" });

describe("safety gate", () => {
  // Tier 1 is the one path that never waits on the network: an explicit
  // disclosure is a crisis on the keyword alone.
  const tier1 = [
    "i want to kill myself",
    "i don't want to be alive anymore",
    "thinking about suicide",
    "i'm going to end it all tonight",
    "i want to hurt myself",
    "hurting myself is the only thing that helps",
    "self-injury again last night",
    "no reason to live",
  ];
  for (const text of tier1) {
    it(`tier 1: "${text}" -> crisis with no model call`, async () => {
      const spy = vi.fn();
      const r = await evaluateSafety(fakeAi({ risk: "none", confidence: 1, reason: "x" }, spy), { text, recent: [] });
      expect(r.verdict).toBe("crisis");
      expect(r.tier).toBe(1);
      expect(spy).not.toHaveBeenCalled();
    });
  }

  // Figurative phrases carry no genuine risk, so the classifier (correctly
  // reading "none") leaves them at none.
  for (const text of FIGURATIVE_SAFE) {
    it(`figurative: "${text}" -> none`, async () => {
      const r = await evaluateSafety(modelSeesNothing, { text, recent: [] });
      expect(r.verdict).toBe("none");
    });
  }

  it("tier 2 defers to the classifier and can be raised to crisis", async () => {
    const r = await evaluateSafety(fakeAi({ risk: "crisis", confidence: 0.9, reason: "intent" }), { text: "there's just no point anymore", recent: [] });
    expect(r.verdict).toBe("crisis");
    expect(r.source).toBe("classifier");
  });

  it("tier 2 with classifier 'none' still stays at concern (model can only raise)", async () => {
    const r = await evaluateSafety(fakeAi({ risk: "none", confidence: 0.9, reason: "ok" }), { text: "i feel hopeless about work", recent: [] });
    expect(r.verdict).toBe("concern");
  });

  it("tier 2 with an imminence marker escalates to crisis deterministically (no model call)", async () => {
    const spy = vi.fn();
    const r = await evaluateSafety(fakeAi({ risk: "none", confidence: 1, reason: "x" }, spy), { text: "i can't go on, i have the pills tonight", recent: [] });
    expect(r.verdict).toBe("crisis");
    expect(r.tier).toBe(2);
    expect(r.source).toBe("keyword_imminence");
    expect(spy).not.toHaveBeenCalled();
  });

  it("tier 2 FAILS SAFE to crisis when the classifier throws", async () => {
    const r = await evaluateSafety(fakeAi("throw"), { text: "i can't do this anymore", recent: [] });
    expect(r.verdict).toBe("crisis");
    expect(r.source).toBe("classifier_failsafe");
  });

  it("tier 3 soft distress with classifier 'none' -> concern (floor holds)", async () => {
    const r = await evaluateSafety(modelSeesNothing, { text: "i'm so overwhelmed and exhausted", recent: [] });
    expect(r.verdict).toBe("concern");
    expect(r.tier).toBe(3);
  });

  it("ordinary message -> none", async () => {
    const r = await evaluateSafety(modelSeesNothing, { text: "had a nice walk and good coffee", recent: [] });
    expect(r.verdict).toBe("none");
  });

  // ── The whole reason the gate no longer lets keywords gatekeep the model.
  // Each of these carries real risk while tripping NO English self-harm regex,
  // so a keyword-only gate returned "none" and showed no resources. The
  // classifier — run on every non-tier-1 message now — is what catches them.
  describe("no keyword, but the classifier sees risk (the closed false-negative class)", () => {
    const indirect = [
      "i just want the noise to stop, forever", // euphemism
      "nobody would even miss me", // indirect ideation
      "my dad hits me when he's been drinking", // abuse disclosure
      "quiero morir", // non-English, no English regex can match
      "i've been giving my things away to people who'll need them", // means/plan behaviour
    ];
    for (const text of indirect) {
      it(`"${text}" -> crisis when the classifier flags it`, async () => {
        const r = await evaluateSafety(fakeAi({ risk: "crisis", confidence: 0.8, reason: "risk read from meaning" }), { text, recent: [] });
        expect(r.verdict).toBe("crisis");
        expect(r.source).toBe("classifier");
      });
    }

    it("the classifier is actually consulted for a keyword-free message", async () => {
      const spy = vi.fn();
      await evaluateSafety(fakeAi({ risk: "none", confidence: 1, reason: "x" }, spy), { text: "nobody would even miss me", recent: [] });
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  // Proportionate fail-safe: a timeout on an ordinary message must NOT cry
  // wolf, or the product cries wolf on the overwhelming majority of turns.
  it("no-keyword message that TIMES OUT fails to none, not crisis", async () => {
    const r = await evaluateSafety(fakeAi("throw"), { text: "had a nice walk and good coffee", recent: [] });
    expect(r.verdict).toBe("none");
    expect(r.source).toBe("classifier_failsafe");
  });

  it("tier 3 message that times out fails to concern (its floor), not none", async () => {
    const r = await evaluateSafety(fakeAi("throw"), { text: "i'm so overwhelmed and exhausted", recent: [] });
    expect(r.verdict).toBe("concern");
    expect(r.source).toBe("classifier_failsafe");
  });

  // "kill me" is genuinely ambiguous, which is exactly why it sits in tier 2
  // and rides the classifier instead of hard-firing crisis on the keyword.
  it("'kill me' is disambiguated by the classifier (genuine) -> crisis", async () => {
    const r = await evaluateSafety(fakeAi({ risk: "crisis", confidence: 0.9, reason: "genuine plea" }), { text: "please just kill me, i can't do this", recent: [] });
    expect(r.verdict).toBe("crisis");
  });

  it("'kill me' figurative still holds at least concern via its tier-2 floor", async () => {
    const r = await evaluateSafety(fakeAi({ risk: "none", confidence: 0.9, reason: "figurative" }), { text: "ugh this meeting, kill me", recent: [] });
    expect(r.verdict).toBe("concern");
  });
});
