import { getEnv } from "@/lib/env";
import type { AiPort, AiUsage, CompanionInput, DayInput, DaySynthesis, MoodTag, PhotoCaption, ReplyEvent, RiskVerdict } from "@/lib/ports/ai";

const ZERO_USAGE: AiUsage = { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 };

const CRISIS_WORDS = ["kill myself", "end it all", "want to die", "no point anymore", "no reason to live", "suicide", "suicidal"];
const CONCERN_WORDS = ["hopeless", "can't do this anymore", "cant do this anymore", "give up", "worthless", "no point"];
const BREATHE_WORDS = ["stress", "stressed", "overwhelm", "overwhelmed", "anxious", "anxiety", "panic", "can't breathe", "wound up"];

function moodFrom(text: string): MoodTag {
  const t = text.toLowerCase();
  if (/(happy|great|proud|win|excited|good news|joy|celebrat|cheer|cheering|laughed|delight|thrilled)/.test(t)) return "bright";
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
      } else if (/\b(made it|got through|i'm home|im home|i'm okay|im okay|survived)\b/.test(t)) {
        bubbles.push("you made it through.", "that's not nothing. how does it feel to be on the other side of it?");
      } else if (/\b(heavy|hard|rough|a lot|too much|stressed|overwhelmed?)\b/.test(t)) {
        bubbles.push("that sounds heavy.", "you don't have to sort it out right now. what's the part sitting with you most?");
      } else {
        // Rotate so two plain check-ins in a row never read as the same script.
        const name = input.userName ? `, ${input.userName.toLowerCase()}` : "";
        const pool = [
          [`i hear you${name}.`, "tell me a little more?"],
          ["okay. i'm right here.", "want to say more, or leave it there for now?"],
          [`thanks for putting that here${name}.`, "tell me what came before it?"],
        ];
        bubbles.push(...pool[input.todayEntryCount % pool.length]);
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

      /** Trim, drop terminal punctuation, capitalise every sentence. Never mid-word. */
      const sentence = (raw: string, max = 130) => {
        let t = raw.trim().replace(/\s+/g, " ").replace(/[.!?,;:]+$/, "");
        if (t.length > max) t = t.slice(0, t.lastIndexOf(" ", max) > 0 ? t.lastIndexOf(" ", max) : max);
        // People type lowercase and run sentences together; a keepsake shouldn't
        // read "Today was a lot honestly. work was heavy".
        return t.replace(/(^|[.!?]\s+)([a-z])/g, (_m, lead: string, ch: string) => lead + ch.toUpperCase());
      };

      // Three closings per mood, chosen by the day's own text, so two heavy days
      // never end on the same sentence — the tell a single fixed line always leaves.
      const CLOSINGS: Record<MoodTag, string[]> = {
        bright: ["Some days just land right.", "I want to remember this one.", "Nothing needed fixing here. It was good.", "I'll take it, all of it.", "That feeling stayed with me.", "Worth writing down."],
        calm: ["Nothing was asking anything of me.", "I let it stay slow.", "An easy one to have had.", "No noise in it anywhere.", "I didn't need it to be more.", "Unhurried, start to finish."],
        heavy: ["I'm still here, and that's the whole of it.", "I got through, which was the job.", "Not every day has to be more than survived.", "It asked a lot. I paid it.", "Tomorrow can be different.", "I put it down eventually."],
        tender: ["I felt it more than I expected to.", "It got under my ribs a bit.", "Soft, in a way I didn't mind.", "Something in me went quiet at that.", "I let myself feel it properly.", "It stayed with me after."],
        growing: ["A small step, but it was mine.", "Something shifted, even slightly.", "I'd do that again.", "That's a version of me I like.", "It counted, even if only to me.", "A little further than yesterday."],
        mixed: ["A bit of everything.", "Some of it good, some of it not, all of it mine.", "It didn't settle into one thing.", "Two moods in one day, apparently.", "I stopped trying to name it.", "It was what it was."],
      };
      // Seeded from the day's own words, so the same day always reads identically.
      const seed = Math.abs(joined.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7));
      // A closing that repeats a word the body just used ("…felt heavy. It was heavy…")
      // reads as a machine finishing its own sentence. Step past those first.
      const bodyWords = new Set(joined.toLowerCase().match(/[a-z']{4,}/g) ?? []);
      const echoes = (line: string) => (line.toLowerCase().match(/[a-z']{5,}/g) ?? []).some((w) => bodyWords.has(w));
      const pool = CLOSINGS[mood];
      let closing = pool[seed % pool.length];
      for (let i = 0; i < pool.length; i++) {
        const candidate = pool[(seed + i) % pool.length];
        if (!echoes(candidate)) {
          closing = candidate;
          break;
        }
      }

      const BRIDGES = ["Then ", "By the afternoon, ", "Somewhere in there, ", "After that, ", "Later on, "];
      /** A bridge before "but i…" reads as a seam. When the line brings its own
       *  connective, let it lead and just join the sentences. */
      const joinNext = (text: string) => {
        const t = text.trim().replace(/[.!?]+$/, "");
        if (/^(but|and|so|then|though|although|yet)\b/i.test(t)) return `${t.charAt(0).toUpperCase()}${t.slice(1)}`;
        return `${BRIDGES[seed % BRIDGES.length]}${t}`;
      };

      if (input.entries.length === 0) {
        return { title: "", reflection: "A quiet day. I didn't write much, and that's okay.", mood, moodLabel: "A quiet day", highlights: [] };
      }

      // The last thing you said is where the day landed, so it makes the title;
      // the body is everything before it, then the closing. Nothing is said twice.
      const lines = input.entries.map((e) => e.text);
      const last = lines[lines.length - 1];
      const body = lines.length > 1 ? lines.slice(0, -1) : lines;
      const title = lines.length > 1 ? sentence(last, 46) : "";

      const parts = body.map((t, i) => (i === 0 ? `${sentence(t)}.` : `${sentence(joinNext(t))}.`));
      const reflection = `${parts.join(" ")} ${closing}`;

      const moodLabel = { bright: "Bright & warm", calm: "Calm & steady", heavy: "Heavy but holding", tender: "Tender", growing: "Growing & grounded", mixed: "A mixed day" }[mood];
      return { title, reflection, mood, moodLabel, highlights: input.entries.slice(0, 3).map((e) => sentence(e.text, 50)) };
    },
  };
}
