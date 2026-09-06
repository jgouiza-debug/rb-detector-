import { getDb, withTx } from "@/lib/db/client";
import { countUserEntriesForDate } from "@/lib/db/repo/messages";
import { getProfile, updateProfile } from "@/lib/db/repo/profiles";
import { seedOpener } from "@/lib/chat/opener";
import { getPorts } from "@/lib/ports";
import { localParts } from "@/lib/time/local";
import { json, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const ports = getPorts();
  const profile = await getProfile(db, s.session.userId);
  if (!profile) return json({ ok: false }, 400);
  const localDate = localParts(ports.clock.now(), profile.timezone || "UTC").date;

  await withTx(async (tx) => {
    if (!profile.onboardedAt) await updateProfile(tx, s.session.userId, { onboardedAt: ports.clock.now() });
    // Pip speaks first (templated, no AI) if the thread is empty.
    const existing = await countUserEntriesForDate(tx, s.session.userId, localDate);
    if (existing === 0) {
      // Only seed if there are truly no pip messages yet.
      await seedOpener(tx, s.session.userId, localDate, profile.name, profile.focus);
    }
  });
  return json({ ok: true });
}
