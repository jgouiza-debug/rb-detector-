import { getEnv } from "@/lib/env";
import type {
  AiPort,
  AiUsage,
  CompanionInput,
  DayInput,
  DaySynthesis,
  MoodTag,
  PhotoCaption,
  ReplyEvent,
  RiskVerdict,
} from "@/lib/ports/ai";

const ZERO_USAGE: AiUsage = {
  inputTokens: 0,
  outputTokens: 0,
  cacheReadTokens: 0,
  cacheWriteTokens: 0,
};

const CRISIS_WORDS = [
  "kill myself",
  "end it all",
  "want to die",
  "no point anymore",
  "no reason to live",
  "suicide",
  "suicidal",
];
const CONCERN_WORDS = [
  "hopeless",
  "can't do this anymore",
  "cant do this anymore",
  "give up",
  "worthless",
  "no point",
];
const BREATHE_WORDS = [
  "stress",
  "stressed",
  "overwhelm",
  "overwhelmed",
  "anxious",
  "anxiety",
  "panic",
  "can't breathe",
  "wound up",
];

function moodFrom(text: string): MoodTag {
  const t = text.toLowerCase();
  if (
    /(happy|great|proud|win|excited|good news|joy|celebrat|cheer|cheering|laughed|delight|thrilled)/.test(
      t,
    )
  )
    return "bright";
  if (/(calm|peace|quiet|rest|slow|breath)/.test(t)) return "calm";
  if (/(sad|heavy|tired|exhausted|hard|grief|lonely|drained)/.test(t))
    return "heavy";
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
        bubbles.push(
          "that sounds like a lot to carry today.",
          "do you want to get into it, or just let it out?",
        );
      } else if (/(happy|great|proud|win|excited|good)/.test(t)) {
        bubbles.push(
          "wait that's actually huge",
          "you should let yourself feel good about that.",
        );
      } else if (
        /\b(made it|got through|i'm home|im home|i'm okay|im okay|survived)\b/.test(
          t,
        )
      ) {
        bubbles.push(
          "you made it through.",
          "that's not nothing. how does it feel to be on the other side of it?",
        );
      } else if (
        /\b(heavy|hard|rough|a lot|too much|stressed|overwhelmed?)\b/.test(t)
      ) {
        bubbles.push(
          "that sounds heavy.",
          "you don't have to sort it out right now. what's the part sitting with you most?",
        );
      } else {
        // Rotate so two plain check-ins in a row never read as the same script.
        const name = input.userName ? `, ${input.userName.toLowerCase()}` : "";
        const pool = [
          [`i hear you${name}.`, "tell me a little more?"],
          [
            "okay. i'm right here.",
            "want to say more, or leave it there for now?",
          ],
          [
            `thanks for putting that here${name}.`,
            "tell me what came before it?",
          ],
        ];
        bubbles.push(...pool[input.todayEntryCount % pool.length]);
      }
      const offerBreathe =
        BREATHE_WORDS.some((w) => t.includes(w)) && !input.careMode;
      // Ask a question no more than "every 4th" — approximated by todayEntryCount.
      if (input.todayEntryCount % 4 === 3)
        bubbles[bubbles.length - 1] = "i'm right here.";
      for (const text of bubbles.slice(0, 3)) yield { type: "bubble", text };
      if (offerBreathe) yield { type: "action", action: "breathe" };
      yield { type: "done", usage: ZERO_USAGE };
    },
    async classifyRisk({ text }): Promise<RiskVerdict> {
      if (getEnv().test.scriptedRiskFail)
        throw new Error(
          "scripted risk classifier failure (PIP_SCRIPTED_RISK_FAIL=1)",
        );
      const t = text.toLowerCase();
      if (CRISIS_WORDS.some((w) => t.includes(w)))
        return {
          risk: "crisis",
          confidence: 0.95,
          reason: "scripted crisis keyword",
        };
      if (CONCERN_WORDS.some((w) => t.includes(w)))
        return {
          risk: "concern",
          confidence: 0.6,
          reason: "scripted concern keyword",
        };
      return {
        risk: "none",
        confidence: 0.9,
        reason: "scripted: no risk markers",
      };
    },
    async captionPhoto({ bytes }): Promise<PhotoCaption> {
      const sensitive = bytes.length > 0 && bytes[0] === 0x00; // deterministic hook for tests
      return {
        caption: "a quiet moment from your day",
        placeHint: "indoors",
        sensitive,
      };
    },
    async synthesizeDay(input: DayInput): Promise<DaySynthesis> {
      const joined = input.entries.map((e) => e.text).join(" ");
      const mood = moodFrom(joined) as MoodTag;

      /** Trim, drop terminal punctuation, capitalise every sentence. Never mid-word. */
      const sentence = (raw: string, max = 130) => {
        let t = raw
          .trim()
          .replace(/\s+/g, " ")
          .replace(/[.!?,;:]+$/, "");
        if (t.length > max)
          t = t.slice(
            0,
            t.lastIndexOf(" ", max) > 0 ? t.lastIndexOf(" ", max) : max,
          );
        // People type lowercase and run sentences together; a keepsake shouldn't
        // read "Today was a lot honestly. work was heavy" — or leave a bare "i".
        return t
          .replace(
            /(^|[.!?]\s+)([a-z])/g,
            (_m, lead: string, ch: string) => lead + ch.toUpperCase(),
          )
          .replace(/\bi\b/g, "I")
          .replace(/\bi'/g, "I'");
      };

      // Only a day with a single line gets one of these, because that is the only
      // day with nothing else to end on. They are deliberately flat observations:
      // an aphorism ("It asked a lot. I paid it.") is a machine trying to sound
      // profound about someone else's evening, and the brand book bans it.
      const CLOSINGS: Record<MoodTag, string[]> = {
        bright: ["A good one.", "That was the day.", "Worth writing down."],
        calm: ["A slow one.", "That was the day.", "No noise in it."],
        heavy: ["A hard one.", "That was the day.", "It was a lot."],
        tender: ["A soft one.", "That was the day.", "It stayed with me."],
        growing: ["A small step.", "That was the day.", "It counted."],
        mixed: ["A bit of everything.", "That was the day.", "Hard to name."],
      };
      // Seeded from the day's own words, so the same day always reads identically.
      const seed = Math.abs(
        joined.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7),
      );
      // A closing that repeats a word the body just used ("…felt heavy. It was heavy…")
      // reads as a machine finishing its own sentence. Step past those first.
      const bodyWords = new Set(
        joined.toLowerCase().match(/[a-z']{4,}/g) ?? [],
      );
      const echoes = (line: string) =>
        (line.toLowerCase().match(/[a-z']{4,}/g) ?? []).some((w) =>
          bodyWords.has(w),
        );
      const pool = CLOSINGS[mood];
      let closing = pool[seed % pool.length];
      for (let i = 0; i < pool.length; i++) {
        const candidate = pool[(seed + i) % pool.length];
        if (!echoes(candidate)) {
          closing = candidate;
          break;
        }
      }

      const BRIDGES = [
        "Then ",
        "By the afternoon, ",
        "Somewhere in there, ",
        "After that, ",
        "Later on, ",
      ];
      /** A bridge before "but i…" reads as a seam. When the line brings its own
       *  connective, let it lead and just join the sentences. */
      const joinNext = (text: string) => {
        const t = text.trim().replace(/[.!?]+$/, "");
        if (/^(but|and|so|then|though|although|yet)\b/i.test(t))
          return `${t.charAt(0).toUpperCase()}${t.slice(1)}`;
        return `${BRIDGES[seed % BRIDGES.length]}${t}`;
      };

      // Photo-only entries carry no text, and a day made of them has nothing to
      // quote — without this filter the reflection opened on a bare ".".
      const lines = input.entries.map((e) => e.text.trim()).filter(Boolean);
      if (lines.length === 0) {
        return {
          title: "",
          reflection: "A quiet day. I didn't write much, and that's okay.",
          mood,
          moodLabel: "a quiet day",
          highlights: [],
        };
      }

      // The last thing you said is where the day landed, so it makes the title;
      // the body is everything before it. Nothing is said twice.
      const last = lines[lines.length - 1];
      const body = lines.length > 1 ? lines.slice(0, -1) : lines;
      // A title is the day in your own words or it is nothing. Truncating mid-clause
      // ("Turns out the team was cheering for me the") is worse than showing the date,
      // and a title that opens on "But" is a fragment of a thought, not a name for one.
      const titleSource = last
        .trim()
        .replace(/^(but|and|so|then|though|although|yet)\s+/i, "")
        .replace(/[.!?,;:]+$/, "");
      const title =
        lines.length > 1 && titleSource.length <= 56
          ? sentence(titleSource, 56)
          : "";

      const parts = body.map((t, i) =>
        i === 0 ? `${sentence(t)}.` : `${sentence(joinNext(t))}.`,
      );
      // A day that gave us more than one line already has an ending: yours. Only
      // the single-line day borrows a closing, so seven cards in one scroll no
      // longer share a cadence.
      const reflection =
        lines.length > 1 ? parts.join(" ") : `${parts.join(" ")} ${closing}`;

      const moodLabel = {
        bright: "bright & warm",
        calm: "calm & steady",
        heavy: "heavy but holding",
        tender: "tender",
        growing: "growing & grounded",
        mixed: "a mixed day",
      }[mood];
      return {
        title,
        reflection,
        mood,
        moodLabel,
        highlights: input.entries.slice(0, 3).map((e) => sentence(e.text, 50)),
      };
    },
  };
}
