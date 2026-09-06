import { and, eq, isNull, lt } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { media, type Media } from "@/lib/db/schema";

type Exec = Db | Tx;

export async function insertMedia(db: Exec, m: { userId: string; keyFull: string; keyThumb: string; width: number; height: number; bytes: number }): Promise<Media> {
  const rows = await db.insert(media).values(m).returning();
  return rows[0];
}

export async function getMedia(db: Exec, userId: string, id: string): Promise<Media | null> {
  const rows = await db.select().from(media).where(and(eq(media.id, id), eq(media.userId, userId))).limit(1);
  return rows[0] ?? null;
}

export async function setCaption(db: Exec, id: string, patch: { aiCaption: string | null; placeHint: string | null; sensitive: boolean; captionStatus: Media["captionStatus"] }): Promise<void> {
  await db.update(media).set(patch).where(eq(media.id, id));
}

export async function mediaForMessages(db: Exec, userId: string, messageIds: string[]): Promise<Media[]> {
  if (messageIds.length === 0) return [];
  const rows = await db.select().from(media).where(eq(media.userId, userId));
  return rows.filter((r) => r.messageId && messageIds.includes(r.messageId));
}

export async function deleteOrphanMedia(db: Exec, olderThan: Date): Promise<Media[]> {
  const rows = await db.select().from(media).where(and(isNull(media.messageId), lt(media.createdAt, olderThan))).limit(500);
  for (const r of rows) await db.delete(media).where(eq(media.id, r.id));
  return rows;
}
