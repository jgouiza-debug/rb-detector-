import { sql } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { rateLimits } from "@/lib/db/schema";

/**
 * Route-facing limiter. In local mode there are no real per-client IPs (every
 * request looks like 0.0.0.0), so per-IP limiting is meaningless and would only
 * throttle a single dev/test user; it's bypassed there. Cloud mode enforces the
 * real limiter. Keep the pure `rateLimit` below for unit tests and direct use.
 */
export async function rateLimitEnforced(db: Db, key: string, opts: { limit: number; windowMs: number }): Promise<{ ok: boolean; remaining: number }> {
  if (getEnv().mode === "local") return { ok: true, remaining: opts.limit };
  return rateLimit(db, key, opts);
}

/**
 * Per-key fixed-window limiter backed by the DB. One atomic upsert does the
 * whole thing: the read-then-update it replaced let two concurrent requests
 * both read the same count and each write count+1, so a burst slipped past the
 * limit. Now the window reset and the increment happen inside a single
 * INSERT ... ON CONFLICT, so a concurrent burst serializes on the row.
 */
export async function rateLimit(db: Db, key: string, opts: { limit: number; windowMs: number }): Promise<{ ok: boolean; remaining: number }> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - opts.windowMs);
  // On conflict: if the stored window is stale, restart it (count 1); otherwise
  // increment within the current window. RETURNING hands back the post-write
  // count, so the decision is made on the value this request actually committed.
  const rows = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStart: now })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.windowStart} < ${cutoff} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${rateLimits.windowStart} < ${cutoff} then ${now} else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count });
  const count = rows[0]?.count ?? 1;
  return { ok: count <= opts.limit, remaining: Math.max(0, opts.limit - count) };
}

export function clientIp(headers: Headers): string {
  // Prefer x-real-ip: the platform (Vercel) overwrites it with the true client IP.
  // The leftmost X-Forwarded-For token is client-supplied and trivially spoofable,
  // so it's only a fallback for environments that don't set x-real-ip.
  const real = headers.get("x-real-ip");
  if (real) return real.trim();
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "0.0.0.0";
}
