export type MoodTag = "bright" | "calm" | "heavy" | "tender" | "growing" | "mixed";
export const MOOD_TAGS: readonly MoodTag[] = ["bright", "calm", "heavy", "tender", "growing", "mixed"];

export interface AiUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface HistoryTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
}

export interface CompanionInput {
  userName: string;
  focus: string[];
  local: { weekday: string; hhmm: string; dayPart: "morning" | "afternoon" | "evening" | "night" };
  careMode: boolean;
  concern: boolean;
  todayEntryCount: number;
  yesterdayMood: MoodTag | null;
  /** Trimmed by lib/ai/context.ts; starts on a user turn; alternates roles. */
  history: HistoryTurn[];
  userText: string;
  /** Current message only, at most 2, already downscaled. */
  images: { bytes: Uint8Array; mediaType: "image/jpeg" | "image/png" | "image/webp" }[];
}

export type ReplyEvent =
  | { type: "bubble"; text: string }
  | { type: "action"; action: "breathe" | "crisis" }
  | { type: "done"; usage: AiUsage };

export interface RiskVerdict {
  risk: "none" | "concern" | "crisis";
  confidence: number;
  reason: string;
}

export interface PhotoCaption {
  caption: string;
  placeHint: string | null;
  sensitive: boolean;
}

export interface DayInput {
  userName: string;
  localDate: string;
  weekday: string;
  careMode: boolean;
  yesterdayMood: MoodTag | null;
  entries: { time: string; text: string; captions: string[] }[];
}

export interface DaySynthesis {
  title: string;
  reflection: string;
  mood: MoodTag;
  moodLabel: string;
  highlights: string[];
}

export interface AiPort {
  reply(input: CompanionInput, opts?: { signal?: AbortSignal }): AsyncIterable<ReplyEvent>;
  /** Throws on error or timeout; callers fail safe to `crisis`. */
  classifyRisk(input: { text: string; recent: string[] }, opts: { timeoutMs: number }): Promise<RiskVerdict>;
  captionPhoto(input: { bytes: Uint8Array; mediaType: "image/jpeg" | "image/png" | "image/webp" }): Promise<PhotoCaption | null>;
  synthesizeDay(input: DayInput): Promise<DaySynthesis | null>;
}
