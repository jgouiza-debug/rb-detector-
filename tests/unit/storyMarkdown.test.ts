import { describe, expect, it } from "vitest";
import { buildStoryMarkdown } from "@/lib/export/storyMarkdown";
import type { Memory, Message } from "@/lib/db/schema";

function mem(date: string, reflection: string): Memory {
  return { id: date, userId: "u", localDate: date, title: "t", reflection, mood: "bright", moodLabel: "Bright & warm", highlights: [], entryCount: 1, mediaIds: [], sourceHash: "h", version: 1, status: "ready", resonated: false, createdAt: new Date(), updatedAt: new Date(), search: "" } as unknown as Memory;
}
function msg(date: string, text: string): Message {
  return { id: `${date}-${text}`, userId: "u", sender: "user", kind: "text", text, clientId: null, groupId: null, replyTo: null, localDate: date, safetyLevel: "none", meta: {}, createdAt: new Date(), search: "" } as unknown as Message;
}

describe("story markdown", () => {
  it("renders each day's memory then its entries, newest first", () => {
    const md = buildStoryMarkdown({
      name: "Sam",
      memories: [mem("2026-10-25", "a walk cleared the fog"), mem("2026-10-26", "felt proud today")],
      messagesByDate: new Map([
        ["2026-10-25", [msg("2026-10-25", "went for a walk")]],
        ["2026-10-26", [msg("2026-10-26", "big review")]],
      ]),
    });
    expect(md).toContain("# Sam's story");
    expect(md).toContain("felt proud today");
    expect(md).toContain("went for a walk");
    // Newest first: Oct 26 heading appears before Oct 25.
    expect(md.indexOf("October 26")).toBeLessThan(md.indexOf("October 25"));
  });
});
