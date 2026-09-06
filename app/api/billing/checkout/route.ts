import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { getProfile } from "@/lib/db/repo/profiles";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { getPorts } from "@/lib/ports";
import { json, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const env = getEnv();
  const profile = await getProfile(db, s.session.userId);
  const sub = await getSubscription(db, s.session.userId);
  const base = env.appUrl;
  const { url, sessionId } = await getPorts().billing.createCheckoutUrl({
    userId: s.session.userId,
    email: profile?.email ?? s.session.email ?? null,
    customerId: sub?.stripeCustomerId ?? null,
    successUrl: `${base}/checkout/done?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${base}/timeline?checkout=cancel`,
  });
  return json({ url, sessionId });
}
