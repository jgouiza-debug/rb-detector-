import type { Memory, Message } from "@/lib/db/schema";
import { formatLongDate } from "@/lib/time/local";

/** Human-readable keepsake: each day's memory, then its raw entries. */
export function buildStoryMarkdown(input: { name: string | null; memories: Memory[]; messagesByDate: Map<string, Message[]> }): string {
  const lines: string[] = [];
  lines.push(`# ${input.name ? `${input.name}'s` : "your"} story`, "", "_kept by pip_", "");
  const dates = Array.from(new Set([...input.memories.map((m) => m.localDate), ...input.messagesByDate.keys()])).sort().reverse();
  for (const date of dates) {
    lines.push(`## ${formatLongDate(date, { year: true })}`, "");
    const mem = input.memories.find((m) => m.localDate === date);
    if (mem && mem.status === "ready") {
      lines.push(`> ${mem.reflection}`, "", `*mood: ${mem.moodLabel || mem.mood}*`, "");
    }
    const msgs = (input.messagesByDate.get(date) ?? []).filter((m) => m.sender === "user");
    if (msgs.length) {
      lines.push("### what you wrote", "");
      for (const m of msgs) lines.push(`- ${m.text}`);
      lines.push("");
    }
  }
  return lines.join("\n");
}
