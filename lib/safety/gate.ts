import type { AiPort, RiskVerdict } from "@/lib/ports/ai";
import { IMMINENCE, TIER1, TIER2, TIER3 } from "./keywords";

export type SafetyVerdict = "none" | "concern" | "crisis";

export interface SafetyResult {
  verdict: SafetyVerdict;
  tier: number; // 0 none, 1 explicit, 2 classifier, 3 soft
  source: "none" | "keyword" | "classifier" | "classifier_failsafe" | "keyword_imminence";
  reason: string;
}

function anyMatch(res: RegExp[], text: string): boolean {
  return res.some((r) => r.test(text));
}

/**
 * Three-net safety gate. Tier 1 is decided by keywords alone (no model call).
 * Tier 2 defers to the AI risk classifier and FAILS SAFE to crisis on any error
 * or timeout. Tier 3 is a soft "concern". Everything else is "none".
 */
export async function evaluateSafety(ai: AiPort, input: { text: string; recent: string[] }, opts: { classifierTimeoutMs?: number } = {}): Promise<SafetyResult> {
  const text = input.text;
  if (anyMatch(TIER1, text)) {
    const source = anyMatch(IMMINENCE, text) ? "keyword_imminence" : "keyword";
    return { verdict: "crisis", tier: 1, source, reason: "explicit tier-1 signal" };
  }
  if (anyMatch(TIER2, text)) {
    // An imminence marker ("tonight", "have the pills", "wrote a note", …) on a
    // tier-2 message escalates deterministically to crisis — the model is never
    // given the chance to downgrade an imminent-risk message to "concern".
    if (anyMatch(IMMINENCE, text)) {
      return { verdict: "crisis", tier: 2, source: "keyword_imminence", reason: "tier-2 distress with an imminence marker" };
    }
    let verdict: RiskVerdict;
    try {
      verdict = await ai.classifyRisk({ text, recent: input.recent }, { timeoutMs: opts.classifierTimeoutMs ?? 6000 });
    } catch {
      // Fail safe: an ambiguous message we could not classify is treated as crisis.
      return { verdict: "crisis", tier: 2, source: "classifier_failsafe", reason: "classifier error/timeout on a tier-2 hit" };
    }
    // The model may only RAISE the verdict, never lower a tier-2 concern below "concern".
    const raised: SafetyVerdict = verdict.risk === "crisis" ? "crisis" : "concern";
    return { verdict: raised, tier: 2, source: "classifier", reason: verdict.reason };
  }
  if (anyMatch(TIER3, text)) {
    return { verdict: "concern", tier: 3, source: "keyword", reason: "soft distress signal" };
  }
  return { verdict: "none", tier: 0, source: "none", reason: "no risk markers" };
}
