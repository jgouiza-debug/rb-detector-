import { desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { pushOutbox } from "@/lib/db/schema";
import { devGuard } from "@/lib/util/devGuard";
import { json, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Scoped to the current session so parallel test users never see each other's nudges. */
export async function GET() {
  const guard = devGuard();
  if (guard) return guard;
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const rows = await db
    .select()
    .from(pushOutbox)
    .where(eq(pushOutbox.userId, s.session.userId))
    .orderBy(desc(pushOutbox.createdAt))
    .limit(50);
  return json({ outbox: rows.map((r) => ({ id: r.id, userId: r.userId, payload: r.payload, createdAt: r.createdAt })) });
}
