import { and, eq, lt } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { rateLimits } from "@/lib/db/schema";

/**
 * Best-effort per-key fixed-window limiter backed by the DB. Documented as
 * approximate on serverless (windows are per-row, not perfectly atomic across
 * concurrent instances), but enough to blunt anonymous-signup and chat abuse.
 */
export async function rateLimit(db: Db, key: string, opts: { limit: number; windowMs: number }): Promise<{ ok: boolean; remaining: number }> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - opts.windowMs);
  await db.delete(rateLimits).where(and(eq(rateLimits.key, key), lt(rateLimits.windowStart, cutoff)));
  const existing = await db.select().from(rateLimits).where(eq(rateLimits.key, key)).limit(1);
  if (existing.length === 0) {
    await db.insert(rateLimits).values({ key, count: 1, windowStart: now }).onConflictDoNothing();
    return { ok: true, remaining: opts.limit - 1 };
  }
  const row = existing[0];
  if (row.count >= opts.limit) return { ok: false, remaining: 0 };
  await db
    .update(rateLimits)
    .set({ count: row.count + 1 })
    .where(eq(rateLimits.key, key));
  return { ok: true, remaining: opts.limit - row.count - 1 };
}

export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "0.0.0.0";
}
