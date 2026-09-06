import { NextRequest } from "next/server";
import { getDb } from "@/lib/db/client";
import { getEnv } from "@/lib/env";
import { getPorts } from "@/lib/ports";
import { parseTestNow } from "@/lib/adapters/clock/testable";
import { runTick } from "@/lib/scheduler/tick";
import { json, jsonError } from "@/lib/util/http";
import { safeEqual } from "@/lib/util/ids";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: NextRequest) {
  const env = getEnv();
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!env.cron.secret || !safeEqual(token, env.cron.secret)) return jsonError(401, "unauthorized");

  const ports = getPorts();
  // Local-only: a test can drive the tick's clock via the x-pip-test-now header.
  const testNow = parseTestNow(req.headers.get("x-pip-test-now"));
  const now = testNow ?? ports.clock.now();

  const db = await getDb();
  const summary = await runTick(db, ports, now);
  return json({ ok: true, at: now.toISOString(), ...summary });
}

export const GET = handle;
export const POST = handle;
