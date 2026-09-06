import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createProfile, updateProfile } from "@/lib/db/repo/profiles";
import { upsertPushSubscription } from "@/lib/db/repo/push";
import { listPushSubscriptions } from "@/lib/db/repo/push";
import { runTick } from "@/lib/scheduler/tick";
import { scriptedAi } from "@/lib/adapters/ai/scripted";
import type { Ports } from "@/lib/ports";
import { pushOutbox } from "@/lib/db/schema";
import { makeTestDb, type TestDb } from "../helpers/db";
import { newId } from "@/lib/util/ids";

let t: TestDb;

function ports(now: Date, sendResult: "ok" | "gone" = "ok"): Ports {
  return {
    clock: { now: () => now },
    ai: scriptedAi(),
    blob: { async get() { return null; }, async put() {}, async deletePrefix() {} },
    push: {
      async send(sub: { endpoint: string }, payload: unknown) {
        if (sendResult === "gone") return "gone";
        await t.db.insert(pushOutbox).values({ userId: sub.endpoint.replace("local://", ""), payload: payload as Record<string, unknown> });
        return "ok";
      },
      publicKey: () => "local",
    },
  } as unknown as Ports;
}

beforeAll(async () => {
  t = await makeTestDb();
});
afterAll(async () => {
  await t.close();
});

describe("nudge delivery", () => {
  it("removes a push subscription that comes back 'gone'", async () => {
    const uid = newId();
    await createProfile(t.db, uid, "UTC");
    await updateProfile(t.db, uid, { morningTime: "08:30" });
    await upsertPushSubscription(t.db, { userId: uid, endpoint: `local://${uid}`, p256dh: "x", auth: "y" });
    // 09:00 UTC -> in the morning window; the send returns 'gone'.
    const at = new Date("2026-06-10T09:00:00Z");
    await runTick(t.db, ports(at, "gone"), at);
    const subs = await listPushSubscriptions(t.db, uid);
    expect(subs).toHaveLength(0);
  });

  it("US spring-forward day still fires the morning nudge (America/New_York, 2026-03-08)", async () => {
    const uid = newId();
    await createProfile(t.db, uid, "America/New_York");
    await updateProfile(t.db, uid, { morningTime: "08:30" });
    await upsertPushSubscription(t.db, { userId: uid, endpoint: `local://${uid}`, p256dh: "x", auth: "y" });
    // 09:00 EDT on the DST-change day = 13:00 UTC.
    const at = new Date("2026-03-08T13:00:00Z");
    await runTick(t.db, ports(at), at);
    const box = await t.db.select().from(pushOutbox);
    expect(box.some((r) => r.userId === uid && (r.payload as { tag: string }).tag === "morning")).toBe(true);
  });

  it("does not fire a morning nudge when the toggle is off", async () => {
    const uid = newId();
    await createProfile(t.db, uid, "UTC");
    await updateProfile(t.db, uid, { morningTime: "08:30", prefs: { morningEnabled: false } });
    await upsertPushSubscription(t.db, { userId: uid, endpoint: `local://${uid}`, p256dh: "x", auth: "y" });
    const at = new Date("2026-06-10T09:00:00Z");
    await runTick(t.db, ports(at), at);
    const box = await t.db.select().from(pushOutbox);
    expect(box.filter((r) => r.userId === uid)).toHaveLength(0);
  });
});
