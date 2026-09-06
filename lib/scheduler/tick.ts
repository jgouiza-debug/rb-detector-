import "server-only";
import { gte, inArray, isNotNull, or } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { messages, profiles, type Profile } from "@/lib/db/schema";
import { claimNudge } from "@/lib/db/repo/nudge";
import { countUserEntriesForDate, insertMessage } from "@/lib/db/repo/messages";
import { listPushSubscriptions, bumpPushFailure, deletePushByEndpoint } from "@/lib/db/repo/push";
import { deleteOrphanMedia } from "@/lib/db/repo/media";
import { purgeOldSafetyEvents } from "@/lib/db/repo/safety";
import type { Ports } from "@/lib/ports";
import type { PushPayload } from "@/lib/ports/push";
import { addDays, hhmmToMinutes, localParts } from "@/lib/time/local";
import { runDay } from "@/lib/synthesis/runDay";

const DUE_WINDOW_MIN = 4 * 60; // due-and-not-sent window
const QUIET_START = 23 * 60;
const QUIET_END = 6 * 60;
const DEFAULT_EVENING = "21:30";

export interface TickSummary {
  users: number;
  morning: number;
  eveningNudge: number;
  synthesized: number;
  dayReady: number;
  finalized: number;
}

/** Idempotent hourly tick. Correct under jitter and a once-a-day cadence. */
export async function runTick(db: Db, ports: Ports, now: Date): Promise<TickSummary> {
  // Include anyone with a reminder time, a recent profile change, OR recent message
  // activity — otherwise a user who skipped rhythm setup (both times null) but keeps
  // journaling would fall out of the tick after 2 days and never get synthesis,
  // day-ready moments, or the finalize sweep (profiles.updatedAt isn't bumped on send).
  const activeCutoff = new Date(now.getTime() - 4 * 86_400_000);
  const rows = await db
    .select()
    .from(profiles)
    .where(
      or(
        isNotNull(profiles.morningTime),
        isNotNull(profiles.eveningTime),
        gte(profiles.updatedAt, new Date(now.getTime() - 2 * 86_400_000)),
        inArray(
          profiles.id,
          db.select({ id: messages.userId }).from(messages).where(gte(messages.createdAt, activeCutoff)),
        ),
      ),
    )
    .limit(2000);

  const summary: TickSummary = { users: rows.length, morning: 0, eveningNudge: 0, synthesized: 0, dayReady: 0, finalized: 0 };
  const deadline = Date.now() + 45_000; // real wall-clock budget (now may be a test clock)

  for (const p of rows) {
    if (Date.now() > deadline) break;
    await handleUser(db, ports, now, p, summary);
  }

  const orphans = await deleteOrphanMedia(db, new Date(now.getTime() - 24 * 3600_000));
  for (const o of orphans) await ports.blob.deletePrefix(`${o.userId}/${o.id}`);
  await purgeOldSafetyEvents(db, new Date(now.getTime() - 90 * 86_400_000));

  return summary;
}

async function handleUser(db: Db, ports: Ports, now: Date, p: Profile, summary: TickSummary) {
  const tz = p.timezone || "UTC";
  const { date, minutes } = localParts(now, tz);
  const quiet = minutes >= QUIET_START || minutes < QUIET_END;
  const prefs = p.prefs ?? {};

  if (p.morningTime && prefs.morningEnabled !== false) {
    const t = hhmmToMinutes(p.morningTime);
    if (minutes >= t && minutes < t + DUE_WINDOW_MIN && !quiet) {
      if (await claimNudge(db, p.id, "morning", date)) {
        summary.morning++;
        await push(db, ports, p.id, { title: "pip", body: `morning${p.name ? `, ${p.name.toLowerCase()}` : ""} anything on your mind?`, url: "/thread", tag: "morning" });
      }
    }
  }

  const eveningT = hhmmToMinutes(p.eveningTime ?? DEFAULT_EVENING);
  if (minutes >= eveningT) {
    const entryCount = await countUserEntriesForDate(db, p.id, date);
    if (entryCount > 0) {
      const res = await runDay(db, ports, p.id, date, "evening");
      if (res.outcome === "created" || res.outcome === "updated") summary.synthesized++;
      if (res.firstForDate && (res.outcome === "created" || res.outcome === "updated")) {
        if (await claimNudge(db, p.id, "day_ready", date)) {
          await insertMessage(db, { userId: p.id, sender: "system", kind: "day_ready", text: "your day is ready to look back on", localDate: date, meta: { memoryDate: date } });
          if (prefs.eveningEnabled !== false) {
            summary.dayReady++;
            await push(db, ports, p.id, { title: "pip", body: "your day is ready to look back on", url: `/memory/${date}`, tag: "day_ready" });
          }
        }
      }
    } else if (p.eveningTime && prefs.eveningEnabled !== false && minutes < eveningT + DUE_WINDOW_MIN && !quiet) {
      if (await claimNudge(db, p.id, "evening_nudge", date)) {
        summary.eveningNudge++;
        await push(db, ports, p.id, { title: "pip", body: "no pressure — want to leave one line about today?", url: "/thread", tag: "evening" });
      }
    }
  }

  if (minutes >= 180) {
    for (let i = 1; i <= 3; i++) {
      const d = addDays(date, -i);
      if (await claimNudge(db, p.id, "finalize", d)) {
        const res = await runDay(db, ports, p.id, d, "finalize");
        if (res.outcome === "created" || res.outcome === "updated") {
          summary.finalized++;
          if (res.firstForDate) await insertMessage(db, { userId: p.id, sender: "system", kind: "day_ready", text: "your day is ready to look back on", localDate: d, meta: { memoryDate: d } });
        }
      }
    }
  }
}

async function push(db: Db, ports: Ports, userId: string, payload: PushPayload) {
  const subs = await listPushSubscriptions(db, userId);
  for (const s of subs) {
    const result = await ports.push.send({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth }, payload);
    if (result === "gone") await deletePushByEndpoint(db, s.endpoint);
    else if (result === "error") await bumpPushFailure(db, s.endpoint);
  }
}
