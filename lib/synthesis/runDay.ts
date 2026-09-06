import "server-only";
import type { Db } from "@/lib/db/client";
import { getMemory, setMemoryStatus, upsertMemory } from "@/lib/db/repo/memories";
import { mediaForMessages } from "@/lib/db/repo/media";
import { userMessagesForDate } from "@/lib/db/repo/messages";
import { getProfile } from "@/lib/db/repo/profiles";
import { bumpUsage } from "@/lib/db/repo/usage";
import type { Ports } from "@/lib/ports";
import type { DayInput, MoodTag } from "@/lib/ports/ai";
import { addDays, formatTime } from "@/lib/time/local";
import { computeSourceHash } from "./sourceHash";

export type SynthReason = "evening" | "finalize" | "manual" | "lazy";
export type SynthOutcome = "created" | "updated" | "skipped" | "failed" | "empty";

export interface SynthResult {
  outcome: SynthOutcome;
  firstForDate: boolean;
  mood?: MoodTag;
}

/**
 * Turn one local day's entries + photo captions into a first-person memory.
 * Idempotent via source_hash. Crisis messages and sensitive photos are excluded.
 */
export async function runDay(db: Db, ports: Ports, userId: string, localDate: string, reason: SynthReason): Promise<SynthResult> {
  const profile = await getProfile(db, userId);
  if (!profile) return { outcome: "skipped", firstForDate: false };
  const tz = profile.timezone || "UTC";

  const userMsgs = await userMessagesForDate(db, userId, localDate);
  if (userMsgs.length === 0) {
    return { outcome: "empty", firstForDate: false };
  }
  const photoMsgIds = userMsgs.filter((m) => m.kind === "photo").map((m) => m.id);
  const allMedia = await mediaForMessages(db, userId, photoMsgIds);
  const media = allMedia.filter((m) => !m.sensitive);

  const careMode = !!profile.careModeUntil && profile.careModeUntil.getTime() > ports.clock.now().getTime();
  const sourceHash = computeSourceHash({ messageIds: userMsgs.map((m) => m.id), mediaIds: media.map((m) => m.id), careMode });

  const existing = await getMemory(db, userId, localDate);
  const firstForDate = !existing || existing.status !== "ready";
  if (existing && existing.status === "ready" && existing.sourceHash === sourceHash && reason !== "manual") {
    return { outcome: "skipped", firstForDate: false, mood: existing.mood as MoodTag };
  }

  const entries: DayInput["entries"] = userMsgs.map((m) => ({
    time: formatTime(m.createdAt, tz),
    text: m.text,
    captions: media.filter((x) => x.messageId === m.id).map((x) => x.aiCaption ?? "").filter(Boolean),
  }));

  const synthesis = await ports.ai.synthesizeDay({
    userName: profile.name ?? "",
    localDate,
    weekday: new Date(`${localDate}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
    careMode,
    yesterdayMood: ((await getMemory(db, userId, addDays(localDate, -1)))?.mood as MoodTag | undefined) ?? null,
    entries,
  });

  if (!synthesis) {
    if (existing) await setMemoryStatus(db, userId, localDate, "failed");
    else await upsertMemory(db, { userId, localDate, title: "", reflection: "", mood: "mixed", moodLabel: "", highlights: [], entryCount: entries.length, mediaIds: media.map((m) => m.id), sourceHash: "", status: "failed" });
    return { outcome: "failed", firstForDate: false };
  }

  await upsertMemory(db, {
    userId,
    localDate,
    title: synthesis.title,
    reflection: synthesis.reflection,
    mood: synthesis.mood,
    moodLabel: synthesis.moodLabel,
    highlights: synthesis.highlights,
    entryCount: entries.length,
    mediaIds: media.map((m) => m.id),
    sourceHash,
    status: "ready",
  });
  await bumpUsage(db, userId, localDate, { syntheses: 1 });
  return { outcome: existing?.status === "ready" ? "updated" : "created", firstForDate, mood: synthesis.mood };
}
