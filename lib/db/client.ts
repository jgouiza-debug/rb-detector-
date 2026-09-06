import type { ExtractTablesWithRelations } from "drizzle-orm";
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

/** Test helper: close and forget the singleton. */
export async function closeDbForTests(): Promise<void> {
  const holder = g.__pipDb;
  g.__pipDb = {};
  if (holder?.close) await holder.close();
}

export { schema };
