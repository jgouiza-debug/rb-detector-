import { and, eq } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { nudgeLog } from "@/lib/db/schema";

type Exec = Db | Tx;
type NudgeKind = "morning" | "evening_nudge" | "evening_synth" | "day_ready" | "finalize";

/** Insert-before-act idempotency: returns true if this (user, kind, date) is claimed by us. */
export async function claimNudge(db: Exec, userId: string, kind: NudgeKind, localDate: string): Promise<boolean> {
  const rows = await db.insert(nudgeLog).values({ userId, kind, localDate }).onConflictDoNothing().returning();
  return rows.length > 0;
}

export async function hasNudge(db: Exec, userId: string, kind: NudgeKind, localDate: string): Promise<boolean> {
  const rows = await db
    .select({ k: nudgeLog.kind })
    .from(nudgeLog)
    .where(and(eq(nudgeLog.userId, userId), eq(nudgeLog.kind, kind), eq(nudgeLog.localDate, localDate)))
    .limit(1);
  return rows.length > 0;
}
