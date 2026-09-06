import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pushOutbox } from "@/lib/db/schema";
import { devGuard } from "@/lib/util/devGuard";
import { json } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const guard = devGuard();
  if (guard) return guard;
  const db = await getDb();
  const rows = await db.select().from(pushOutbox).orderBy(desc(pushOutbox.createdAt)).limit(50);
  return json({ outbox: rows.map((r) => ({ id: r.id, userId: r.userId, payload: r.payload, createdAt: r.createdAt })) });
}
