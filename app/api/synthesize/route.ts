import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { getDailyUsage, getGlobalUsage } from "@/lib/db/repo/usage";
import { getPorts } from "@/lib/ports";
import { runDay } from "@/lib/synthesis/runDay";
import { localParts, isISODate } from "@/lib/time/local";
import { getProfile } from "@/lib/db/repo/profiles";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({ date: z.string().optional() });

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const ports = getPorts();
  const profile = await getProfile(db, s.session.userId);
  const today = localParts(ports.clock.now(), profile?.timezone || "UTC").date;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  const date = parsed.success && parsed.data.date && isISODate(parsed.data.date) ? parsed.data.date : today;

  const usage = await getDailyUsage(db, s.session.userId, today);
  if (usage.syntheses >= getEnv().caps.synthesis) return jsonError(429, "synthesis_cap", "you've wrapped up a few days already — come back tomorrow");
  // Fleet-wide backstop so a burst of accounts can't run up the synthesis bill.
  const globalUsage = await getGlobalUsage(db, today);
  if (globalUsage.syntheses >= getEnv().caps.globalSynthesis) return jsonError(429, "synthesis_busy", "we're at capacity for today — try again tomorrow");

  const res = await runDay(db, ports, s.session.userId, date, "manual");
  return json({ ok: res.outcome !== "failed", outcome: res.outcome, mood: res.mood ?? null });
}
