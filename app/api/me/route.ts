import { getDb } from "@/lib/db/client";
import { getEntitlement } from "@/lib/billing/entitlements";
import { getProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { json, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const ports = getPorts();
  const profile = await getProfile(db, s.session.userId);
  const ent = await getEntitlement(db, s.session.userId, ports.clock.now());
  return json({
    userId: s.session.userId,
    email: s.session.email,
    isAnonymous: s.session.isAnonymous,
    name: profile?.name ?? null,
    onboarded: !!profile?.onboardedAt,
    needsEmailLink: profile?.needsEmailLink ?? false,
    // True during the 24h care window after a crisis. The email-link prompt
    // must not surface over someone who just reached out in distress.
    inCareMode:
      !!profile?.careModeUntil &&
      profile.careModeUntil.getTime() > ports.clock.now().getTime(),
    plan: ent.plan,
    prefs: profile?.prefs ?? {},
    morningTime: profile?.morningTime ?? null,
    eveningTime: profile?.eveningTime ?? null,
    timezone: profile?.timezone ?? "UTC",
  });
}
