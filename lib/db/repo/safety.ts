import { lt } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { safetyEvents } from "@/lib/db/schema";

type Exec = Db | Tx;

export async function recordSafetyEvent(db: Exec, e: { userId: string; messageId: string | null; tier: number; verdict: "none" | "concern" | "crisis"; source: string }): Promise<void> {
  await db.insert(safetyEvents).values(e);
}

export async function purgeOldSafetyEvents(db: Exec, olderThan: Date): Promise<void> {
  await db.delete(safetyEvents).where(lt(safetyEvents.createdAt, olderThan));
}
