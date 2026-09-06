import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import type { Db } from "@/lib/db/client";
import { migratePglite } from "@/lib/db/migrate";
import * as schema from "@/lib/db/schema";

export interface TestDb {
  db: Db;
  raw: PGlite;
  /** Run as an authenticated user so RLS policies apply (like the Supabase client key). */
  asUser<T>(userId: string, fn: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

/** Fresh in-memory Postgres with all migrations applied. One per test file. */
export async function makeTestDb(): Promise<TestDb> {
  const raw = new PGlite("memory://");
  await raw.waitReady;
  await migratePglite(raw);
  const db = drizzle(raw, { schema }) as unknown as Db;
  return {
    db,
    raw,
    async asUser(userId, fn) {
      await raw.exec(`select set_config('request.jwt.claim.sub', '${userId}', false); set role authenticated;`);
      try {
        return await fn();
      } finally {
        await raw.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
      }
    },
    close: () => raw.close(),
  };
}

export const UID_A = "11111111-1111-1111-1111-111111111111";
export const UID_B = "22222222-2222-2222-2222-222222222222";
