import { getEnv } from "@/lib/env";
import type { AiPort, AiUsage, CompanionInput, DayInput, DaySynthesis, MoodTag, PhotoCaption, ReplyEvent, RiskVerdict } from "@/lib/ports/ai";

const ZERO_USAGE: AiUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };

const CRISIS_WORDS = ["kill myself", "end it all", "want to die", "no point anymore", "no reason to live", "suicide", "suicidal"];
const CONCERN_WORDS = ["hopeless", "can't do this anymore", "cant do this anymore", "give up", "worthless", "no point"];
const BREATHE_WORDS = ["stress", "stressed", "overwhelm", "overwhelmed", "anxious", "anxiety", "panic", "can't breathe", "wound up"];

function moodFrom(text: string): MoodTag {
  const t = text.toLowerCase();
  if (/(happy|great|proud|win|excited|good news|joy|celebrat)/.test(t)) return "bright";
  if (/(calm|peace|quiet|rest|slow|breath)/.test(t)) return "calm";
  if (/(sad|heavy|tired|exhausted|hard|grief|lonely|drained)/.test(t)) return "heavy";
  if (/(miss|love|tender|soft|gentle|care|cry)/.test(t)) return "tender";
  if (/(learn|grow|progress|step|better|try)/.test(t)) return "growing";
  return "mixed";
}

/** Deterministic offline AI so the whole journey is Playwright-testable with zero network. */
export function scriptedAi(): AiPort {
  return {
    async *reply(input: CompanionInput): AsyncIterable<ReplyEvent> {
      const t = input.userText.toLowerCase();
      const bubbles: string[] = [];
      if (input.images.length > 0 && !input.userText.trim()) {
        bubbles.push("ooh, love this.", "what was happening here?");
      } else if (/(tired|exhausted|drained)/.test(t)) {
        bubbles.push("that sounds like a lot to carry today.", "do you want to get into it, or just let it out?");
      } else if (/(happy|great|proud|win|excited|good)/.test(t)) {
        bubbles.push("wait that's actually huge", "you should let yourself feel good about that.");
      } else {
        bubbles.push(`i hear you${input.userName ? `, ${input.userName.toLowerCase()}` : ""}.`, "tell me a little more?");
      }
      const offerBreathe = BREATHE_WORDS.some((w) => t.includes(w)) && !input.careMode;
      // Ask a question no more than "every 4th" — approximated by todayEntryCount.
      if (input.todayEntryCount % 4 === 3) bubbles[bubbles.length - 1] = "i'm right here.";
      for (const text of bubbles.slice(0, 3)) yield { type: "bubble", text };
      if (offerBreathe) yield { type: "action", action: "breathe" };
      yield { type: "done", usage: ZERO_USAGE };
    },
    async classifyRisk({ text }): Promise<RiskVerdict> {
      if (getEnv().test.scriptedRiskFail) throw new Error("scripted risk classifier failure (PIP_SCRIPTED_RISK_FAIL=1)");
      const t = text.toLowerCase();
      if (CRISIS_WORDS.some((w) => t.includes(w))) return { risk: "crisis", confidence: 0.95, reason: "scripted crisis keyword" };
      if (CONCERN_WORDS.some((w) => t.includes(w))) return { risk: "concern", confidence: 0.6, reason: "scripted concern keyword" };
      return { risk: "none", confidence: 0.9, reason: "scripted: no risk markers" };
    },
    async captionPhoto({ bytes }): Promise<PhotoCaption> {
      const sensitive = bytes.length > 0 && bytes[0] === 0x00; // deterministic hook for tests
      return { caption: "a quiet moment from your day", placeHint: "indoors", sensitive };
    },
    async synthesizeDay(input: DayInput): Promise<DaySynthesis> {
      const joined = input.entries.map((e) => e.text).join(" ");
      const mood = moodFrom(joined) as MoodTag;
      const firstWords = (input.entries[0]?.text ?? "a quiet day").split(/\s+/).slice(0, 4).join(" ");
      const reflection =
        input.entries.length === 0
          ? "A quiet day. I didn't write much, and that's okay."
          : `Today I ${input.entries[0]?.text?.slice(0, 80) ?? "kept going"}. ${input.entries.length > 1 ? "Later, " + (input.entries[1]?.text?.slice(0, 80) ?? "more happened") + "." : ""} Looking back, it felt like a lot to hold, and I got through it.`;
      const moodLabel = { bright: "Bright & warm", calm: "Calm & steady", heavy: "Heavy but holding", tender: "Tender", growing: "Growing & grounded", mixed: "A mixed day" }[mood];
      return {
        title: firstWords.charAt(0).toUpperCase() + firstWords.slice(1),
        reflection: reflection.trim(),
        mood,
        moodLabel,
        highlights: input.entries.slice(0, 3).map((e) => e.text.slice(0, 50)),
      };
    },
  };
}
