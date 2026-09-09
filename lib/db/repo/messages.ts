import { and, asc, desc, eq, gte, lt, ne, or, sql } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import {
  media,
  messages,
  type Message,
  type MessageMeta,
} from "@/lib/db/schema";

type Exec = Db | Tx;

export interface InsertMessage {
  userId: string;
  sender: "user" | "pip" | "system";
  kind?: Message["kind"];
  text?: string;
  clientId?: string | null;
  groupId?: string | null;
  replyTo?: string | null;
  localDate: string;
  safetyLevel?: Message["safetyLevel"];
  meta?: MessageMeta;
  /**
   * Normally the DB stamps this. Pass it to order bubbles inserted inside one
   * transaction: defaultNow() gives every row in a tx the same instant, and the
   * paging query then tie-breaks on desc(id) where id is a random UUID — so a
   * group written in a loop renders in random order. The crisis bubbles are the
   * one place that order is a safety property ("i'm a small app…" must precede
   * "keep talking here"), and it was the one place it was randomised.
   */
  createdAt?: Date;
}

export async function insertMessage(
  db: Exec,
  m: InsertMessage,
): Promise<Message> {
  const rows = await db
    .insert(messages)
    .values({
      userId: m.userId,
      sender: m.sender,
      kind: m.kind ?? "text",
      text: m.text ?? "",
      clientId: m.clientId ?? null,
      groupId: m.groupId ?? null,
      replyTo: m.replyTo ?? null,
      localDate: m.localDate,
      safetyLevel: m.safetyLevel ?? "none",
      meta: m.meta ?? {},
      ...(m.createdAt ? { createdAt: m.createdAt } : {}),
    })
    .onConflictDoNothing({ target: [messages.userId, messages.clientId] })
    .returning();
  if (rows.length) return rows[0];
  // client_id collision: return the existing row (idempotent retry).
  const existing = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.userId, m.userId),
        eq(messages.clientId, m.clientId ?? ""),
      ),
    )
    .limit(1);
  if (existing.length) return existing[0];
  throw new Error("insertMessage: no row");
}

export async function setMessageSafety(
  db: Exec,
  id: string,
  level: Message["safetyLevel"],
): Promise<void> {
  await db
    .update(messages)
    .set({ safetyLevel: level })
    .where(eq(messages.id, id));
}

export async function recentTurns(
  db: Exec,
  userId: string,
  limit = 40,
): Promise<Message[]> {
  const rows = await db
    .select()
    .from(messages)
    .where(eq(messages.userId, userId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);
  return rows.reverse();
}

export async function messagesForDate(
  db: Exec,
  userId: string,
  localDate: string,
): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .where(and(eq(messages.userId, userId), eq(messages.localDate, localDate)))
    .orderBy(asc(messages.createdAt));
}

export async function userMessagesForDate(
  db: Exec,
  userId: string,
  localDate: string,
): Promise<Message[]> {
  return db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.localDate, localDate),
        eq(messages.sender, "user"),
        ne(messages.safetyLevel, "crisis"),
      ),
    )
    .orderBy(asc(messages.createdAt));
}

export async function countUserEntriesForDate(
  db: Exec,
  userId: string,
  localDate: string,
): Promise<number> {
  const rows = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(messages)
    .where(
      and(
        eq(messages.userId, userId),
        eq(messages.localDate, localDate),
        eq(messages.sender, "user"),
      ),
    );
  return rows[0]?.n ?? 0;
}

export async function pageMessages(
  db: Exec,
  userId: string,
  opts: { before?: Date; beforeId?: string; limit: number },
): Promise<Message[]> {
  const base = eq(messages.userId, userId);
  // (createdAt, id) is a stable, unique cursor: the id tiebreaker prevents dropping
  // rows that share a timestamp across a page boundary (matters for a complete export).
  const where =
    opts.before && opts.beforeId
      ? and(
          base,
          or(
            lt(messages.createdAt, opts.before),
            and(
              eq(messages.createdAt, opts.before),
              lt(messages.id, opts.beforeId),
            ),
          ),
        )
      : opts.before
        ? and(base, lt(messages.createdAt, opts.before))
        : base;
  const rows = await db
    .select()
    .from(messages)
    .where(where)
    .orderBy(desc(messages.createdAt), desc(messages.id))
    .limit(opts.limit);
  return rows.reverse();
}

export async function messagesAroundDate(
  db: Exec,
  userId: string,
  localDate: string,
): Promise<Message[]> {
  // A small window around a date for the deep link.
  const rows = await db
    .select()
    .from(messages)
    .where(and(eq(messages.userId, userId), gte(messages.localDate, localDate)))
    .orderBy(asc(messages.createdAt))
    .limit(80);
  return rows;
}

export async function attachMediaToMessage(
  db: Exec,
  userId: string,
  messageId: string,
  mediaIds: string[],
): Promise<void> {
  for (const id of mediaIds) {
    await db
      .update(media)
      .set({ messageId })
      .where(and(eq(media.id, id), eq(media.userId, userId)));
  }
}
