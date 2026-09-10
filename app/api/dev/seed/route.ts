import { NextRequest } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { messages as messagesTable } from "@/lib/db/schema";
import { attachMediaToMessage, insertMessage } from "@/lib/db/repo/messages";
import { insertMedia, setCaption } from "@/lib/db/repo/media";
import { processImage } from "@/lib/media/process";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { runDay } from "@/lib/synthesis/runDay";
import { addDays, localParts } from "@/lib/time/local";
import { devGuard } from "@/lib/util/devGuard";
import { json, requireSession } from "@/lib/util/http";
import { newId } from "@/lib/util/ids";
import fs from "node:fs/promises";
import path from "node:path";

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

  // One seeded day carries a photo: the keepsake card is specified to hold the
  // day's images, and a fixture that never produces one hides that surface from
  // every screenshot and every review of it.
  let photoBytes: Uint8Array | null = null;
  try {
    photoBytes = new Uint8Array(await fs.readFile(path.join(process.cwd(), "tests/e2e/fixtures/photo.jpg")));
  } catch {
    /* fixture missing: seed text-only rather than failing the whole seed */
  }

  for (let i = days; i >= 1; i--) {
    const date = addDays(today, -i);
    const [a, b] = SAMPLE[i % SAMPLE.length];
    const first = await insertMessage(db, { userId: s.session.userId, sender: "user", text: a, clientId: newId(), localDate: date });
    if (i === 1 && photoBytes) {
      const processed = await processImage(s.session.userId, photoBytes);
      const row = await insertMedia(db, {
        userId: s.session.userId,
        keyFull: processed.keyFull,
        keyThumb: processed.keyThumb,
        width: processed.width,
        height: processed.height,
        bytes: processed.bytes,
      });
      await setCaption(db, row.id, { aiCaption: "a quiet moment from your day", placeHint: "indoors", sensitive: false, captionStatus: "done" });
      await attachMediaToMessage(db, s.session.userId, first.id, [row.id]);
      await db.update(messagesTable).set({ kind: "photo" }).where(and(eq(messagesTable.id, first.id), eq(messagesTable.userId, s.session.userId)));
    }
    await insertMessage(db, { userId: s.session.userId, sender: "user", text: b, clientId: newId(), localDate: date });
    await runDay(db, ports, s.session.userId, date, "manual");
  }
  return json({ ok: true, seeded: days });
}
