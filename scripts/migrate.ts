/* Apply drizzle/*.sql to DATABASE_URL (Supabase pooler or any Postgres). Usage: pnpm db:migrate */
import postgres from "postgres";
import { migratePostgres } from "../lib/db/migrate";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }
  const sql = postgres(url, { prepare: false, max: 1 });
  try {
    const applied = await migratePostgres(sql);
    console.log(applied.length ? `applied: ${applied.join(", ")}` : "already up to date");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
