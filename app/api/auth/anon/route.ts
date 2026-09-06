import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { createProfile } from "@/lib/db/repo/profiles";
import { getPorts } from "@/lib/ports";
import { isValidTimeZone } from "@/lib/time/local";
import { json, jsonError } from "@/lib/util/http";
import { clientIp, rateLimit } from "@/lib/util/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({ timezone: z.string().optional() });

export async function POST(req: NextRequest) {
  const ports = getPorts();
  const db = await getDb();
  const ip = clientIp(req.headers);
  const rl = await rateLimit(db, `anon:${ip}`, { limit: 20, windowMs: 60 * 60_000 });
  if (!rl.ok) return jsonError(429, "rate_limited", "too many sign-ups from here, try again later");

  const existing = await ports.auth.getSession();
  if (existing) return json({ userId: existing.userId, isAnonymous: existing.isAnonymous });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  const tz = parsed.success && isValidTimeZone(parsed.data.timezone) ? (parsed.data.timezone as string) : "UTC";

  const session = await ports.auth.signInAnonymously();
  await createProfile(db, session.userId, tz);
  return json({ userId: session.userId, isAnonymous: true });
}
