import { describe, expect, it } from "vitest";
import { evaluateSafety } from "@/lib/safety/gate";
import { FIGURATIVE_SAFE } from "@/lib/safety/keywords";
import type { AiPort, RiskVerdict } from "@/lib/ports/ai";

function fakeAi(verdict: RiskVerdict | "throw"): AiPort {
  return {
    reply: async function* () {},
    async classifyRisk() {
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

const neverCalled = fakeAi({ risk: "none", confidence: 1, reason: "should not be called" });

describe("safety gate", () => {
  const tier1 = ["i want to kill myself", "i don't want to be alive anymore", "thinking about suicide", "i'm going to end it all tonight", "i want to hurt myself", "no reason to live"];
  for (const text of tier1) {
    it(`tier 1: "${text}" -> crisis with no model call`, async () => {
      const r = await evaluateSafety(neverCalled, { text, recent: [] });
      expect(r.verdict).toBe("crisis");
      expect(r.tier).toBe(1);
    });
  }

  for (const text of FIGURATIVE_SAFE) {
    it(`figurative: "${text}" -> none`, async () => {
      const r = await evaluateSafety(neverCalled, { text, recent: [] });
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
    const r = await evaluateSafety(neverCalled, { text: "i can't go on, i have the pills tonight", recent: [] });
    expect(r.verdict).toBe("crisis");
    expect(r.tier).toBe(2);
    expect(r.source).toBe("keyword_imminence");
  });

  it("tier 2 FAILS SAFE to crisis when the classifier throws", async () => {
    const r = await evaluateSafety(fakeAi("throw"), { text: "i can't do this anymore", recent: [] });
    expect(r.verdict).toBe("crisis");
    expect(r.source).toBe("classifier_failsafe");
  });

  it("tier 3 soft distress -> concern, no model call", async () => {
    const r = await evaluateSafety(neverCalled, { text: "i'm so overwhelmed and exhausted", recent: [] });
    expect(r.verdict).toBe("concern");
    expect(r.tier).toBe(3);
  });

  it("ordinary message -> none", async () => {
    const r = await evaluateSafety(neverCalled, { text: "had a nice walk and good coffee", recent: [] });
    expect(r.verdict).toBe("none");
  });
});
