import { NextRequest } from "next/server";
import { z } from "zod";
import { applyBillingEvent } from "@/lib/billing/applyEvent";
import { getPorts } from "@/lib/ports";
import { json, jsonError } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const Body = z.object({ sessionId: z.string().min(1) });

/** Belt-and-braces path for when the webhook is late/misconfigured on first deploy. */
export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input");
  const ev = await getPorts().billing.syncCheckoutSession(parsed.data.sessionId);
  if (!ev) return json({ ok: false, note: "no subscription on that session yet" });
  const outcome = await applyBillingEvent(ev);
  return json({ ok: true, outcome });
}
