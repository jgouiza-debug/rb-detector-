import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/client";
import { mediaForMessages } from "@/lib/db/repo/media";
import { messagesAroundDate, pageMessages } from "@/lib/db/repo/messages";
import { isISODate } from "@/lib/time/local";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const sp = req.nextUrl.searchParams;
  const around = sp.get("around");
  // Validate the date cursors before they reach SQL: a junk `around` would make
  // Postgres raise on the date column, and a junk `before` yields an Invalid Date.
  if (around && !isISODate(around)) return jsonError(400, "bad_around");
  const beforeRaw = sp.get("before");
  const before = beforeRaw ? new Date(beforeRaw) : undefined;
  if (before && Number.isNaN(before.getTime())) return jsonError(400, "bad_before");
  const limit = Math.min(80, Math.max(10, Number(sp.get("limit") ?? 50)));

  const rows = around ? await messagesAroundDate(db, s.session.userId, around) : await pageMessages(db, s.session.userId, { before, limit });
  const photoIds = rows.filter((m) => m.kind === "photo").map((m) => m.id);
  const media = await mediaForMessages(db, s.session.userId, photoIds);

  return json({
    messages: rows.map((m) => ({
      id: m.id,
      sender: m.sender,
      kind: m.kind,
      text: m.text,
      groupId: m.groupId,
      localDate: m.localDate,
      safetyLevel: m.safetyLevel,
      meta: m.meta,
      createdAt: m.createdAt,
      media: media
        .filter((x) => x.messageId === m.id)
        .map((x) => ({ id: x.id, captionStatus: x.captionStatus, caption: x.aiCaption, sensitive: x.sensitive, width: x.width, height: x.height })),
    })),
    nextBefore: rows.length ? rows[0].createdAt : null,
  });
}
