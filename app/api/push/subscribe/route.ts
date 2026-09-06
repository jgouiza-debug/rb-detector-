import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { upsertPushSubscription } from "@/lib/db/repo/push";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ endpoint: z.string().min(1), p256dh: z.string(), auth: z.string() });

export async function POST(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input");
  // Local synthetic endpoints get scoped to the user so the outbox targets the right person.
  const endpoint = parsed.data.endpoint === "local://self" ? `local://${s.session.userId}` : parsed.data.endpoint;
  const db = await getDb();
  await upsertPushSubscription(db, { userId: s.session.userId, endpoint, p256dh: parsed.data.p256dh, auth: parsed.data.auth, userAgent: req.headers.get("user-agent") });
  return json({ ok: true });
}
