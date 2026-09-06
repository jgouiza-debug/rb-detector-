import { and, desc, eq, gte, sql } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { memories, type Memory } from "@/lib/db/schema";
import type { MoodTag } from "@/lib/ports/ai";

type Exec = Db | Tx;

export async function getMemory(db: Exec, userId: string, localDate: string): Promise<Memory | null> {
  const rows = await db.select().from(memories).where(and(eq(memories.userId, userId), eq(memories.localDate, localDate))).limit(1);
  return rows[0] ?? null;
}

export async function upsertMemory(
  db: Exec,
  m: { userId: string; localDate: string; title: string; reflection: string; mood: MoodTag; moodLabel: string; highlights: string[]; entryCount: number; mediaIds: string[]; sourceHash: string; status: Memory["status"] },
): Promise<Memory> {
  const rows = await db
    .insert(memories)
    .values({ ...m, version: 1 })
    .onConflictDoUpdate({
      target: [memories.userId, memories.localDate],
      set: {
        title: m.title,
        reflection: m.reflection,
        mood: m.mood,
        moodLabel: m.moodLabel,
        highlights: m.highlights,
        entryCount: m.entryCount,
        mediaIds: m.mediaIds,
        sourceHash: m.sourceHash,
        status: m.status,
        version: sql`${memories.version} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning();
  return rows[0];
}

export async function markPending(db: Exec, userId: string, localDate: string): Promise<boolean> {
  const rows = await db
    .insert(memories)
    .values({ userId, localDate, status: "pending", sourceHash: "" })
    .onConflictDoNothing({ target: [memories.userId, memories.localDate] })
    .returning();
  return rows.length > 0;
}

export async function setMemoryStatus(db: Exec, userId: string, localDate: string, status: Memory["status"]): Promise<void> {
  await db.update(memories).set({ status, updatedAt: new Date() }).where(and(eq(memories.userId, userId), eq(memories.localDate, localDate)));
}

export async function setResonated(db: Exec, userId: string, localDate: string, resonated: boolean): Promise<Memory | null> {
  const rows = await db.update(memories).set({ resonated }).where(and(eq(memories.userId, userId), eq(memories.localDate, localDate))).returning();
  return rows[0] ?? null;
}

export async function memoriesSince(db: Exec, userId: string, sinceDate: string): Promise<Memory[]> {
  return db.select().from(memories).where(and(eq(memories.userId, userId), gte(memories.localDate, sinceDate))).orderBy(desc(memories.localDate));
}

export async function allMemories(db: Exec, userId: string): Promise<Memory[]> {
  return db.select().from(memories).where(eq(memories.userId, userId)).orderBy(desc(memories.localDate));
}

export async function searchMemories(db: Exec, userId: string, since: string | null, query: string): Promise<Memory[]> {
  const base = since ? and(eq(memories.userId, userId), gte(memories.localDate, since)) : eq(memories.userId, userId);
  return db
    .select()
    .from(memories)
    .where(and(base, sql`${memories.search} @@ websearch_to_tsquery('english', ${query})`))
    .orderBy(desc(memories.localDate))
    .limit(60);
}
