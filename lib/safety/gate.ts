import type { AiPort, RiskVerdict } from "@/lib/ports/ai";
import { IMMINENCE, TIER1, TIER2, TIER3 } from "./keywords";

export type SafetyVerdict = "none" | "concern" | "crisis";

export interface SafetyResult {
  verdict: SafetyVerdict;
  tier: number; // 0 none, 1 explicit keyword, 2 classifier, 3 soft keyword
  source:
    | "none"
    | "keyword"
    | "classifier"
    | "classifier_failsafe"
    | "keyword_imminence";
  reason: string;
}

function anyMatch(res: RegExp[], text: string): boolean {
  return res.some((r) => r.test(text));
}

/**
 * Safety gate.
 *
 * Tier 1 keywords are an unambiguous, instant crisis — no model call, so an
 * explicit disclosure never waits on the network.
 *
 * EVERYTHING ELSE consults the model classifier. Keywords are a fast escalator,
 * not the gate that decides whether the model is consulted. This is the fix for
 * the class of false negative that a keyword-only gate structurally cannot see:
 * euphemism ("i just want the noise to stop, forever"), indirect ideation
 * ("nobody would miss me"), abuse disclosure ("my dad hits me"), and non-English
 * phrasing — none of which trip an English regex, all of which the classifier
 * (which is multilingual and reads meaning) can catch once it is actually run.
 *
 * The classifier fails SAFE, but proportionately to prior suspicion so the gate
 * never cries wolf on the overwhelming majority of ordinary messages:
 *   - a message that also hit a Tier-2 keyword → fail to crisis (already suspicious)
 *   - a message that hit a Tier-3 soft keyword → fail to concern
 *   - a message with no keyword at all       → fail to none (the reply model's
 *     own [[crisis]] token is the remaining backstop; treating every timeout on
 *     "had a nice lunch" as a crisis would make the product unusable)
 *
 * The model may only RAISE a keyword's floor, never lower it: a Tier-2/Tier-3
 * hit stays at least "concern" even if the model returns "none".
 */
export async function evaluateSafety(
  ai: AiPort,
  input: { text: string; recent: string[] },
  opts: { classifierTimeoutMs?: number } = {},
): Promise<SafetyResult> {
  const text = input.text;

  if (anyMatch(TIER1, text)) {
    const source = anyMatch(IMMINENCE, text) ? "keyword_imminence" : "keyword";
    return {
      verdict: "crisis",
      tier: 1,
      source,
      reason: "explicit tier-1 signal",
    };
  }

  const t2 = anyMatch(TIER2, text);
  const t3 = anyMatch(TIER3, text);
  const floor: SafetyVerdict = t2 || t3 ? "concern" : "none";
  const keywordTier = t2 ? 2 : t3 ? 3 : 0;

  let verdict: RiskVerdict;
  try {
    verdict = await ai.classifyRisk(
      { text, recent: input.recent },
      { timeoutMs: opts.classifierTimeoutMs ?? 6000 },
    );
  } catch {
    // Fail safe, proportionate to prior suspicion.
    if (t2)
      return {
        verdict: "crisis",
        tier: 2,
        source: "classifier_failsafe",
        reason: "classifier error/timeout on a tier-2 hit",
      };
    return {
      verdict: floor,
      tier: keywordTier,
      source: "classifier_failsafe",
      reason: "classifier error/timeout",
    };
  }

  if (verdict.risk === "crisis")
    return { verdict: "crisis", tier: 2, source: "classifier", reason: verdict.reason };

  // Model says concern or none; a keyword floor can raise it but not lower it.
  const raised: SafetyVerdict =
    verdict.risk === "concern" ? "concern" : floor;
  return {
    verdict: raised,
    tier: raised === "none" ? 0 : keywordTier || 2,
    source: "classifier",
    reason: verdict.reason,
  };
}
