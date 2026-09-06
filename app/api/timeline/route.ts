import { NextRequest, after } from "next/server";
import { getDb } from "@/lib/db/client";
import { getMemory, markPending } from "@/lib/db/repo/memories";
import { userMessagesForDate } from "@/lib/db/repo/messages";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import type { MoodTag } from "@/lib/ports/ai";
import { getTimeline } from "@/lib/timeline/query";
import { runDay } from "@/lib/synthesis/runDay";
import { addDays, localParts } from "@/lib/time/local";
import { json, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MOODS = ["bright", "calm", "heavy", "tender", "growing", "mixed"];

export async function GET(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const ports = getPorts();
  const profile = await getProfile(db, s.session.userId);
  const tz = profile?.timezone || "UTC";
  const today = localParts(ports.clock.now(), tz).date;

  const sp = req.nextUrl.searchParams;
  const q = sp.get("q") ?? undefined;
  const moodParam = sp.get("mood");
  const mood = moodParam && MOODS.includes(moodParam) ? (moodParam as MoodTag) : null;

  // Lazy synthesis: schedule up to 2 missing PAST days (never today) in the background.
  const scheduled: string[] = [];
  for (let i = 1; i <= 2; i++) {
    const d = addDays(today, -i);
    const existing = await getMemory(db, s.session.userId, d);
    if (existing && existing.status === "ready") continue;
    const entries = await userMessagesForDate(db, s.session.userId, d);
    if (entries.length === 0) continue;
    if (await markPending(db, s.session.userId, d)) {
      scheduled.push(d);
    } else if (existing?.status === "failed") {
      scheduled.push(d);
    }
  }
  if (scheduled.length) {
    after(async () => {
      for (const d of scheduled) {
        try {
          await runDay(db, ports, s.session.userId, d, "lazy");
        } catch {
          /* retried next open */
        }
      }
    });
  }

  const timeline = await getTimeline(db, s.session.userId, ports.clock.now(), today, { query: q, mood });
  return json({ ...timeline, today, priceLabel: null, pending: scheduled });
}
