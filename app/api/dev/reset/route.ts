import { getDb } from "@/lib/db/client";
import { sql } from "drizzle-orm";
import { devGuard } from "@/lib/util/devGuard";
import { json } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const guard = devGuard();
  if (guard) return guard;
  const db = await getDb();
  for (const t of ["messages", "media", "memories", "subscriptions", "billing_events", "push_subscriptions", "nudge_log", "usage_daily", "usage_global", "safety_events", "push_outbox", "profiles"]) {
    await db.execute(sql.raw(`delete from "${t}"`));
  }
  return json({ ok: true });
}
