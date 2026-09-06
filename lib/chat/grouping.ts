export interface GroupableMessage {
  id: string;
  sender: "user" | "pip" | "system";
  createdAt: string; // ISO
  localDate: string;
}

export interface DecoratedMessage<T extends GroupableMessage> {
  message: T;
  firstInGroup: boolean;
  lastInGroup: boolean;
  showDayDivider: boolean;
  showTime: boolean;
}

const GROUP_WINDOW_MS = 3 * 60_000;
const TIME_GAP_MS = 20 * 60_000;

/** Pure grouping: consecutive same-sender messages within 3 min form a group;
 * a day divider precedes the first message of a new local date; a time label
 * shows after a gap > 20 min. Input must be chronological (oldest first). */
export function decorate<T extends GroupableMessage>(messages: T[]): DecoratedMessage<T>[] {
  return messages.map((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const t = new Date(m.createdAt).getTime();
    const prevT = prev ? new Date(prev.createdAt).getTime() : -Infinity;
    const nextT = next ? new Date(next.createdAt).getTime() : Infinity;
    const sameGroupAsPrev = !!prev && prev.sender === m.sender && m.sender !== "system" && t - prevT <= GROUP_WINDOW_MS;
    const sameGroupAsNext = !!next && next.sender === m.sender && m.sender !== "system" && nextT - t <= GROUP_WINDOW_MS;
    return {
      message: m,
      firstInGroup: !sameGroupAsPrev,
      lastInGroup: !sameGroupAsNext,
      showDayDivider: !prev || prev.localDate !== m.localDate,
      showTime: !prev || t - prevT > TIME_GAP_MS,
    };
  });
}

/** Bubble landing dwell used by the client to stagger Pip's reply. */
export function dwellMs(text: string): number {
  return Math.min(2200, 500 + 25 * text.length);
}
