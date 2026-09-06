import { getDb } from "@/lib/db/client";
import { listPushSubscriptions } from "@/lib/db/repo/push";
import { getPorts } from "@/lib/ports";
import { json, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const ports = getPorts();
  const subs = await listPushSubscriptions(db, s.session.userId);
  let sent = 0;
  for (const sub of subs) {
    const r = await ports.push.send({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth }, { title: "pip", body: "just checking this works 🌱", url: "/thread", tag: "test" });
    if (r === "ok") sent++;
  }
  return json({ ok: true, sent, subscriptions: subs.length });
}
