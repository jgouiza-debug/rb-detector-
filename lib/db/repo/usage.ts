import { and, eq, sql } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { usageDaily, usageGlobal } from "@/lib/db/schema";

type Exec = Db | Tx;

export async function bumpUsage(
  db: Exec,
  userId: string,
  localDate: string,
  delta: { replies?: number; captions?: number; syntheses?: number; tokensIn?: number; tokensOut?: number },
): Promise<void> {
  const d = { replies: 0, captions: 0, syntheses: 0, tokensIn: 0, tokensOut: 0, ...delta };
  await db
    .insert(usageDaily)
    .values({ userId, localDate, replies: d.replies, captions: d.captions, syntheses: d.syntheses, tokensIn: d.tokensIn, tokensOut: d.tokensOut })
    .onConflictDoUpdate({
      target: [usageDaily.userId, usageDaily.localDate],
      set: {
        replies: sql`${usageDaily.replies} + ${d.replies}`,
        captions: sql`${usageDaily.captions} + ${d.captions}`,
        syntheses: sql`${usageDaily.syntheses} + ${d.syntheses}`,
        tokensIn: sql`${usageDaily.tokensIn} + ${d.tokensIn}`,
        tokensOut: sql`${usageDaily.tokensOut} + ${d.tokensOut}`,
      },
    });
  await db
    .insert(usageGlobal)
    .values({ localDate, replies: d.replies, captions: d.captions, syntheses: d.syntheses, tokensIn: d.tokensIn, tokensOut: d.tokensOut })
    .onConflictDoUpdate({
      target: usageGlobal.localDate,
      set: {
        replies: sql`${usageGlobal.replies} + ${d.replies}`,
        captions: sql`${usageGlobal.captions} + ${d.captions}`,
        syntheses: sql`${usageGlobal.syntheses} + ${d.syntheses}`,
        tokensIn: sql`${usageGlobal.tokensIn} + ${d.tokensIn}`,
        tokensOut: sql`${usageGlobal.tokensOut} + ${d.tokensOut}`,
      },
    });
}

export async function getDailyUsage(db: Exec, userId: string, localDate: string) {
  const rows = await db.select().from(usageDaily).where(and(eq(usageDaily.userId, userId), eq(usageDaily.localDate, localDate))).limit(1);
  return rows[0] ?? { userId, localDate, replies: 0, captions: 0, syntheses: 0, tokensIn: 0, tokensOut: 0 };
}

export async function getGlobalUsage(db: Exec, localDate: string) {
  const rows = await db.select().from(usageGlobal).where(eq(usageGlobal.localDate, localDate)).limit(1);
  return rows[0] ?? { localDate, replies: 0, captions: 0, syntheses: 0, tokensIn: 0, tokensOut: 0 };
}
