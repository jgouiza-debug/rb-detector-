import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { getSubscription } from "@/lib/db/repo/subscriptions";
import { getPorts } from "@/lib/ports";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const db = await getDb();
  const sub = await getSubscription(db, s.session.userId);
  if (!sub?.stripeCustomerId) return jsonError(400, "no_customer", "no subscription to manage yet");
  const url = await getPorts().billing.createPortalUrl({ customerId: sub.stripeCustomerId, returnUrl: `${getEnv().appUrl}/settings/subscription` });
  return json({ url });
}
