import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/client";
import { isDateLocked } from "@/lib/billing/window";
import { getMemory, setResonated } from "@/lib/db/repo/memories";
import { mediaForMessages } from "@/lib/db/repo/media";
import { messagesForDate } from "@/lib/db/repo/messages";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { formatTime, isISODate, localParts } from "@/lib/time/local";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ date: string }> },
) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const { date } = await ctx.params;
  if (!isISODate(date)) return jsonError(400, "bad_date");
  const db = await getDb();
  const ports = getPorts();
  const profile = await getProfile(db, s.session.userId);
  const tz = profile?.timezone || "UTC";
  const today = localParts(ports.clock.now(), tz).date;

  if (await isDateLocked(db, s.session.userId, date, ports.clock.now(), today))
    return jsonError(
      402,
      "locked",
      "this day is part of your full story, kept with pip+",
    );

  const memory = await getMemory(db, s.session.userId, date);
  const dayMsgs = await messagesForDate(db, s.session.userId, date);
  const userMsgs = dayMsgs.filter((m) => m.sender === "user");
  const photoIds = dayMsgs.filter((m) => m.kind === "photo").map((m) => m.id);
  const media = await mediaForMessages(db, s.session.userId, photoIds);

  return json({
    date,
    memory: memory
      ? {
          title: memory.title,
          reflection: memory.reflection,
          mood: memory.mood,
          moodLabel: memory.moodLabel,
          highlights: memory.highlights,
          status: memory.status,
          resonated: memory.resonated,
          entryCount: memory.entryCount,
        }
      : null,
    entries: userMsgs.map((m) => ({
      id: m.id,
      text: m.text,
      time: formatTime(m.createdAt, tz),
      kind: m.kind,
      media: media
        .filter((x) => x.messageId === m.id)
        .map((x) => ({
          id: x.id,
          caption: x.aiCaption,
          sensitive: x.sensitive,
        })),
    })),
    photos: media
      .filter((x) => !x.sensitive)
      .map((x) => ({ id: x.id, caption: x.aiCaption, placeHint: x.placeHint })),
  });
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ date: string }> },
) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const { date } = await ctx.params;
  if (!isISODate(date)) return jsonError(400, "bad_date");
  const body = (await req.json().catch(() => ({}))) as { resonated?: boolean };
  const db = await getDb();
  const updated = await setResonated(
    db,
    s.session.userId,
    date,
    !!body.resonated,
  );
  return json({ ok: true, resonated: updated?.resonated ?? false });
}
