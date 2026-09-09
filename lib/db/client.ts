import { sql, type ExtractTablesWithRelations } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT, PgTransaction } from "drizzle-orm/pg-core";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;
export type Tx = PgTransaction<PgQueryResultHKT, typeof schema, ExtractTablesWithRelations<typeof schema>>;

type Holder = { promise?: Promise<Db>; close?: () => Promise<void> };
const g = globalThis as unknown as { __pipDb?: Holder };

async function openPglite(dataDir: string): Promise<{ db: Db; close: () => Promise<void> }> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migratePglite } = await import("./migrate");
  const client = new PGlite(dataDir);
  await client.waitReady;
  await migratePglite(client);
  const db = drizzle(client, { schema }) as unknown as Db;
  return { db, close: () => client.close() };
}

async function openPostgres(url: string): Promise<{ db: Db; close: () => Promise<void> }> {
  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const client = postgres(url, { prepare: false, max: 1, idle_timeout: 20, connect_timeout: 10 });
  const db = drizzle(client, { schema }) as unknown as Db;
  return { db, close: () => client.end({ timeout: 5 }) };
}

/** Process-wide singleton (survives Next dev HMR via globalThis). */
export function getDb(): Promise<Db> {
  if (!g.__pipDb) g.__pipDb = {};
  if (g.__pipDb.promise) return g.__pipDb.promise;
  const env = getEnv();
  const opened = env.providers.db === "pglite" ? openPglite(env.db.pgliteDir) : openPostgres(env.db.url as string);
  g.__pipDb.promise = opened.then(({ db, close }) => {
    g.__pipDb!.close = close;
    return db;
  });
  g.__pipDb.promise.catch(() => {
    g.__pipDb = {};
  });
  return g.__pipDb.promise;
}

export async function withTx<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const db = await getDb();
  return db.transaction(async (tx) => fn(tx as unknown as Tx));
}

/**
 * A transaction that runs UNDER the `authenticated` role with the caller's id
 * bound as auth.uid(), so row-level security enforces owner-scoping at the
 * database — a backstop for a repo that forgets its own userId filter.
 *
 * This is deliberately NOT the default. Cross-user server work (the scheduler,
 * Stripe webhooks, admin/cron) must keep using withTx on the service-role
 * connection, which bypasses RLS. Use withUserTx only for a request that acts
 * solely on one signed-in user's own rows.
 *
 * Enforcement only bites when the underlying connection is a non-BYPASSRLS
 * role. On a service-role/superuser connection the SET local role still scopes
 * auth.uid() correctly but the role bypasses the policies; the isolation is
 * proven under the `authenticated` role in tests/int/rls.test.ts.
 */
export async function withUserTx<T>(userId: string, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const db = await getDb();
  return db.transaction(async (tx) => {
    // set local ... is scoped to this transaction and rolled back with it, so
    // the pooled connection is never left carrying a stale identity.
    await tx.execute(sql`select set_config('request.jwt.claim.sub', ${userId}, true)`);
    await tx.execute(sql`set local role authenticated`);
    return fn(tx as unknown as Tx);
  });
}

/** Test helper: close and forget the singleton. */
export async function closeDbForTests(): Promise<void> {
  const holder = g.__pipDb;
  g.__pipDb = {};
  if (holder?.close) await holder.close();
}

export { schema };
