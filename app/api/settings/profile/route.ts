import { NextRequest } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db/client";
import { getProfile, updateProfile } from "@/lib/db/repo/profiles";
import { isHHmm, isValidTimeZone } from "@/lib/time/local";
import { json, jsonError, requireSession } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  name: z.string().max(60).nullable().optional(),
  focus: z.array(z.string().max(40)).max(6).optional(),
  timezone: z.string().optional(),
  morningTime: z.string().nullable().optional(),
  eveningTime: z.string().nullable().optional(),
  prefs: z.object({ morningEnabled: z.boolean().optional(), eveningEnabled: z.boolean().optional(), haptics: z.boolean().optional(), theme: z.enum(["system", "light", "dark"]).optional() }).optional(),
});

export async function PATCH(req: NextRequest) {
  const s = await requireSession();
  if ("response" in s) return s.response;
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return jsonError(400, "bad_input", parsed.error.message);
  const b = parsed.data;
  if (b.morningTime != null && !isHHmm(b.morningTime)) return jsonError(400, "bad_time");
  if (b.eveningTime != null && !isHHmm(b.eveningTime)) return jsonError(400, "bad_time");

  const db = await getDb();
  const current = await getProfile(db, s.session.userId);
  const patch: Parameters<typeof updateProfile>[2] = {};
  if (b.name !== undefined) patch.name = b.name;
  if (b.focus !== undefined) patch.focus = b.focus;
  if (b.timezone !== undefined && isValidTimeZone(b.timezone)) patch.timezone = b.timezone;
  if (b.morningTime !== undefined) patch.morningTime = b.morningTime;
  if (b.eveningTime !== undefined) patch.eveningTime = b.eveningTime;
  if (b.prefs !== undefined) patch.prefs = { ...(current?.prefs ?? {}), ...b.prefs };
  const updated = await updateProfile(db, s.session.userId, patch);
  return json({ ok: true, profile: updated });
}
