import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { insertMessage } from "@/lib/db/repo/messages";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { runDay } from "@/lib/synthesis/runDay";
import { addDays, localParts } from "@/lib/time/local";
import { devGuard } from "@/lib/util/devGuard";
import { json, requireSession } from "@/lib/util/http";
import { newId } from "@/lib/util/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAMPLE = [
  ["woke up slow, made coffee and just sat with it for a while", "the light was really nice this morning"],
  ["big review at work today, i was so nervous going in", "turns out the team was cheering for me the whole time"],
  ["went for a walk under the amber leaves after lunch", "three days of fog just lifted"],
  ["quiet evening, made tea and listened to the rain", "felt genuinely peaceful for once"],
  ["missed my old friends today, texted a few of them", "we're getting dinner next week"],
  ["tried the new recipe and it actually worked", "small win but i'll take it"],
  ["hard day honestly, everything felt heavy", "but i got through it, and that counts"],
  ["planted the little succulent on the windowsill", "watching it grow feels good"],
  ["long call with mom, laughed a lot", "i should do that more often"],
  ["read on the balcony until the sun went down", "no agenda, just rest"],
];

export async function POST(req: NextRequest) {
  const guard = devGuard();
  if (guard) return guard;
  const s = await requireSession();
  if ("response" in s) return s.response;
  const body = z.object({ days: z.number().min(1).max(30).default(10) }).safeParse(await req.json().catch(() => ({})));
  const days = body.success ? body.data.days : 10;

  const db = await getDb();
  const ports = getPorts();
  const profile = await getProfile(db, s.session.userId);
  const today = localParts(ports.clock.now(), profile?.timezone || "UTC").date;

  for (let i = days; i >= 1; i--) {
    const date = addDays(today, -i);
    const [a, b] = SAMPLE[i % SAMPLE.length];
    await insertMessage(db, { userId: s.session.userId, sender: "user", text: a, clientId: newId(), localDate: date });
    await insertMessage(db, { userId: s.session.userId, sender: "user", text: b, clientId: newId(), localDate: date });
    await runDay(db, ports, s.session.userId, date, "manual");
  }
  return json({ ok: true, seeded: days });
}
