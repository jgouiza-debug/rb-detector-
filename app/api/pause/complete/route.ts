import { getDb } from "@/lib/db/client";
import { insertMessage } from "@/lib/db/repo/messages";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { localParts } from "@/lib/time/local";
import { json, requireSession } from "@/lib/util/http";
import { newId } from "@/lib/util/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const ports = getPorts();
  const profile = await getProfile(db, s.session.userId);
  const localDate = localParts(ports.clock.now(), profile?.timezone || "UTC").date;
  await insertMessage(db, { userId: s.session.userId, sender: "system", kind: "pause_done", text: "you took a pause", localDate });
  const gid = newId();
  await insertMessage(db, { userId: s.session.userId, sender: "pip", kind: "text", text: "nice. want to tell me how that felt?", groupId: gid, localDate });
  return json({ ok: true });
}
