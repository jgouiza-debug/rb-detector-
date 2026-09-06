import type { HistoryTurn } from "@/lib/ports/ai";

export interface RawTurn {
  id: string;
  role: "user" | "assistant";
  kind: string;
  text: string;
  caption?: string | null;
}

const MAX_TURNS = 20;
const MAX_CHARS = 24_000; // ~6k tokens at chars/4

/**
 * Build the model history: drop crisis/system turns, merge consecutive same-role
 * turns (Pip's 1-3 bubbles become one assistant turn), render photos as
 * "[photo: caption]", trim to the window, and ensure it starts on a user turn.
 * Anchor hysteresis keeps the cache prefix stable turn to turn.
 */
export function buildHistory(turns: RawTurn[]): { history: HistoryTurn[]; anchorId: string | null } {
  // `voice` notes are quiet thought-bumps: they belong to the day's journal (and
  // synthesis picks them up) but they are not part of the live back-and-forth, so
  // they stay out of the reply context, same as system `note`s.
  const usable = turns.filter((t) => (t.role === "user" || t.role === "assistant") && t.kind !== "crisis" && t.kind !== "day_ready" && t.kind !== "note" && t.kind !== "voice" && t.kind !== "pause_offer" && t.kind !== "pause_done");

  // Merge consecutive same-role turns.
  const merged: HistoryTurn[] = [];
  for (const t of usable) {
    const rendered = t.kind === "photo" ? `[photo: ${t.caption ?? "a photo"}]${t.text ? ` ${t.text}` : ""}` : t.text;
    if (!rendered.trim()) continue;
    const last = merged[merged.length - 1];
    if (last && last.role === t.role) last.text += `\n${rendered}`;
    else merged.push({ id: t.id, role: t.role, text: rendered });
  }

  // Window: keep last MAX_TURNS and under MAX_CHARS, then ensure it starts on a user turn.
  let start = Math.max(0, merged.length - MAX_TURNS);
  let windowed = merged.slice(start);
  while (windowed.reduce((n, t) => n + t.text.length, 0) > MAX_CHARS && windowed.length > 1) {
    start++;
    windowed = merged.slice(start);
  }
  while (windowed.length && windowed[0].role !== "user") windowed = windowed.slice(1);

  const anchorId = windowed[0]?.id ?? null;
  return { history: windowed, anchorId };
}
