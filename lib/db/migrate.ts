import fs from "node:fs";
import path from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import type { Sql } from "postgres";

const MIGRATIONS_DIR = path.join(process.cwd(), "drizzle");
const SHIM_PATH = path.join(process.cwd(), "db", "local", "auth-shim.sql");

interface JournalEntry {
  idx: number;
  tag: string;
  when: number;
}

function readJournal(): JournalEntry[] {
  const p = path.join(MIGRATIONS_DIR, "meta", "_journal.json");
  if (!fs.existsSync(p)) return [];
  const j = JSON.parse(fs.readFileSync(p, "utf8")) as { entries: JournalEntry[] };
  return j.entries;
}

/** drizzle-kit separates statements with this marker inside one migration file. */
function statementsOf(file: string): string[] {
  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
  return sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
}

type Exec = (sql: string) => Promise<unknown>;
type Query = (sql: string) => Promise<{ rows: Record<string, unknown>[] }>;

async function runMigrations(exec: Exec, query: Query, opts: { shim: boolean }): Promise<string[]> {
  if (opts.shim) await exec(fs.readFileSync(SHIM_PATH, "utf8"));
  await exec(`create table if not exists "__pip_migrations" (tag text primary key, applied_at timestamptz not null default now())`);
  const done = new Set((await query(`select tag from "__pip_migrations"`)).rows.map((r) => String(r.tag)));
  const applied: string[] = [];
  for (const entry of readJournal()) {
    if (done.has(entry.tag)) continue;
    for (const stmt of statementsOf(`${entry.tag}.sql`)) await exec(stmt);
    await exec(`insert into "__pip_migrations" (tag) values ('${entry.tag.replace(/'/g, "''")}')`);
    applied.push(entry.tag);
  }
  return applied;
}

export async function migratePglite(client: PGlite): Promise<string[]> {
  return runMigrations(
    (s) => client.exec(s),
    async (s) => ({ rows: (await client.query<Record<string, unknown>>(s)).rows }),
    { shim: true },
  );
}

export async function migratePostgres(sql: Sql): Promise<string[]> {
  return runMigrations(
    (s) => sql.unsafe(s),
    async (s) => ({ rows: (await sql.unsafe(s)) as unknown as Record<string, unknown>[] }),
    { shim: false },
  );
}
