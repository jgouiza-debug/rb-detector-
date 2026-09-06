import type { Db } from "@/lib/db/client";
import { allMemories, memoriesSince, searchMemories } from "@/lib/db/repo/memories";
import { mediaForMessages } from "@/lib/db/repo/media";
import { messagesForDate } from "@/lib/db/repo/messages";
import type { Memory } from "@/lib/db/schema";
import type { MoodTag } from "@/lib/ports/ai";
import { addDays } from "@/lib/time/local";
import { getEntitlement } from "@/lib/billing/entitlements";

export interface TimelineDay {
  date: string;
  title: string;
  reflection: string;
  mood: MoodTag;
  moodLabel: string;
  entryCount: number;
  status: Memory["status"];
  thumbs: { id: string; caption: string | null }[];
}

export interface WeekFlowDot {
  date: string;
  dow: number;
  mood: MoodTag | null;
}

export interface TimelineResult {
  plan: "free" | "plus";
  windowDays: number | null;
  windowStart: string | null;
  days: TimelineDay[];
  lockedCount: number;
  weekFlow: WeekFlowDot[];
}

async function toDay(db: Db, userId: string, m: Memory): Promise<TimelineDay> {
  const dayMsgs = await messagesForDate(db, userId, m.localDate);
  const photoIds = dayMsgs.filter((x) => x.kind === "photo").map((x) => x.id);
  const media = (await mediaForMessages(db, userId, photoIds)).filter((x) => !x.sensitive).slice(0, 4);
  return {
    date: m.localDate,
    title: m.title,
    reflection: m.reflection,
    mood: m.mood as MoodTag,
    moodLabel: m.moodLabel,
    entryCount: m.entryCount,
    status: m.status,
    thumbs: media.map((x) => ({ id: x.id, caption: x.aiCaption })),
  };
}

export async function getTimeline(db: Db, userId: string, now: Date, todayDate: string, opts: { query?: string; mood?: MoodTag | null } = {}): Promise<TimelineResult> {
  const ent = await getEntitlement(db, userId, now);
  const windowStart = ent.windowDays ? addDays(todayDate, -(ent.windowDays - 1)) : null;

  let memories: Memory[];
  if (opts.query && opts.query.trim()) {
    memories = await searchMemories(db, userId, windowStart, opts.query.trim());
  } else if (windowStart) {
    memories = await memoriesSince(db, userId, windowStart);
  } else {
    memories = await allMemories(db, userId);
  }
  if (opts.mood) memories = memories.filter((m) => m.mood === opts.mood);
  const visible = memories.filter((m) => m.status === "ready" || m.status === "pending");

  const days = await Promise.all(visible.map((m) => toDay(db, userId, m)));

  // Locked count: memories that exist outside the free window.
  let lockedCount = 0;
  if (windowStart) {
    const all = await allMemories(db, userId);
    lockedCount = all.filter((m) => m.status === "ready" && m.localDate < windowStart).length;
  }

  // Week flow: the last 7 local days, with mood if a memory exists.
  const weekMemories = await memoriesSince(db, userId, addDays(todayDate, -6));
  const moodByDate = new Map(weekMemories.map((m) => [m.localDate, m.mood as MoodTag]));
  const weekFlow: WeekFlowDot[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = addDays(todayDate, -i);
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
    weekFlow.push({ date, dow: (dow + 6) % 7, mood: moodByDate.get(date) ?? null });
  }

  return { plan: ent.plan, windowDays: ent.windowDays, windowStart, days, lockedCount, weekFlow };
}
