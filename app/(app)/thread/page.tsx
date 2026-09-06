import { getDb } from "@/lib/db/client";
import { mediaForMessages } from "@/lib/db/repo/media";
import { pageMessages } from "@/lib/db/repo/messages";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { localParts } from "@/lib/time/local";
import { Thread } from "@/components/chat/Thread";
import type { UiMessage } from "@/lib/store/threadStore";
import { requireSessionRedirect } from "@/lib/util/session";

export const dynamic = "force-dynamic";

export default async function ThreadPage() {
  const session = await requireSessionRedirect();
  const db = await getDb();
  const ports = getPorts();
  const profile = await getProfile(db, session.userId);
  const localDate = localParts(ports.clock.now(), profile?.timezone || "UTC").date;

  const rows = await pageMessages(db, session.userId, { limit: 60 });
  const photoIds = rows.filter((m) => m.kind === "photo").map((m) => m.id);
  const media = await mediaForMessages(db, session.userId, photoIds);

  const initial: UiMessage[] = rows.map((m) => ({
    id: m.id,
    sender: m.sender,
    kind: m.kind,
    text: m.text,
    groupId: m.groupId,
    localDate: m.localDate,
    safetyLevel: m.safetyLevel,
    meta: m.meta,
    createdAt: m.createdAt.toISOString(),
    media: media.filter((x) => x.messageId === m.id).map((x) => ({ id: x.id, captionStatus: x.captionStatus, caption: x.aiCaption, sensitive: x.sensitive })),
  }));

  return <Thread initial={initial} localDate={localDate} />;
}
