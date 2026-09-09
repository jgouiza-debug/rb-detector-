import type { Tx } from "@/lib/db/client";
import { insertMessage } from "@/lib/db/repo/messages";
import { newId } from "@/lib/util/ids";

/** Pip speaks first. Templated (no AI call), personalized by name + focus chips. */
export function openerBubbles(name: string | null, focus: string[]): string[] {
  const hi = name ? `hey ${name.toLowerCase()}` : "hey";
  const focusLine = focus.includes("processing a lot")
    ? "sounds like there's a lot going on. no need to sort it out — just say it however it comes."
    : focus.includes("building a habit")
      ? "we'll keep this easy. one line a day is more than enough to start."
      : focus.includes("remembering my days")
        ? "i'll quietly keep whatever you send, so you can look back later."
        : "no rules here. tell me anything, whenever.";
  return [
    `${hi}. i'm really glad you're here.`,
    focusLine,
    "so — how are you, right now?",
  ];
}

export async function seedOpener(
  tx: Tx,
  userId: string,
  localDate: string,
  name: string | null,
  focus: string[],
): Promise<void> {
  const groupId = newId();
  const bubbles = openerBubbles(name, focus);
  // Same transaction, same defaultNow() instant — stamp +i ms so the greeting
  // renders in written order rather than random-UUID order.
  const base = Date.now();
  let i = 0;
  for (const text of bubbles) {
    await insertMessage(tx, {
      userId,
      sender: "pip",
      kind: "text",
      text,
      groupId,
      localDate,
      meta: { bubbleIndex: i, bubbleCount: bubbles.length },
      createdAt: new Date(base + i),
    });
    i++;
  }
  await insertMessage(tx, {
    userId,
    sender: "system",
    kind: "note",
    text: "pip is a companion for reflection, not a therapist. if things ever get heavy, help is one tap away.",
    localDate,
    createdAt: new Date(base + bubbles.length),
  });
}
