import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createProfile, updateProfile } from "@/lib/db/repo/profiles";
import { insertMessage } from "@/lib/db/repo/messages";
import { upsertPushSubscription } from "@/lib/db/repo/push";
import { getMemory } from "@/lib/db/repo/memories";
import { runTick } from "@/lib/scheduler/tick";
import { scriptedAi } from "@/lib/adapters/ai/scripted";
import type { Ports } from "@/lib/ports";
import { messages, profiles, pushOutbox } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { makeTestDb, type TestDb } from "../helpers/db";
import { newId } from "@/lib/util/ids";

let t: TestDb;
function portsAt(now: Date): Ports {
  return {
    clock: { now: () => now },
    ai: scriptedAi(),
    blob: { async get() { return null; }, async put() {}, async deletePrefix() {} },
    push: {
      async send(sub: { endpoint: string }, payload: unknown) {
        await t.db.insert(pushOutbox).values({ userId: sub.endpoint.replace("local://", ""), payload: payload as unknown as Record<string, unknown> });
        return "ok";
      },
      publicKey: () => "local",
    },
  } as unknown as Ports;
}

async function outbox(userId: string) {
  const rows = await t.db.select().from(pushOutbox).orderBy(desc(pushOutbox.createdAt));
  return rows.filter((r) => r.userId === userId);
}

beforeAll(async () => {
  t = await makeTestDb();
});
afterAll(async () => {
  await t.close();
});

describe("scheduler tick", () => {
  it("LA user: morning nudge fires once in-window and never twice", async () => {
    const uid = newId();
    await createProfile(t.db, uid, "America/Los_Angeles");
    await updateProfile(t.db, uid, { name: "Sam", morningTime: "08:30", eveningTime: "21:00" });
    await upsertPushSubscription(t.db, { userId: uid, endpoint: `local://${uid}`, p256dh: "x", auth: "y" });

    // 09:00 local in LA on 2026-06-10 (PDT, UTC-7) = 16:00 UTC.
    await runTick(t.db, portsAt(new Date("2026-06-10T16:00:00Z")), new Date("2026-06-10T16:00:00Z"));
    let box = await outbox(uid);
    expect(box.some((r) => (r.payload as { tag: string }).tag === "morning")).toBe(true);
    const count1 = box.length;
    // Second tick same window -> no duplicate.
    await runTick(t.db, portsAt(new Date("2026-06-10T16:30:00Z")), new Date("2026-06-10T16:30:00Z"));
    box = await outbox(uid);
    expect(box.filter((r) => (r.payload as { tag: string }).tag === "morning")).toHaveLength(1);
    expect(box.length).toBe(count1);
  });

  it("evening tick synthesizes exactly one memory and a late writer re-synthesizes", async () => {
    const uid = newId();
    await createProfile(t.db, uid, "America/Los_Angeles");
    await updateProfile(t.db, uid, { eveningTime: "21:00" });
    await upsertPushSubscription(t.db, { userId: uid, endpoint: `local://${uid}`, p256dh: "x", auth: "y" });
    // Local date 2026-06-10; write an entry, then tick at 21:30 local (04:30 UTC next day).
    await insertMessage(t.db, { userId: uid, sender: "user", text: "a bright and easy day", clientId: newId(), localDate: "2026-06-10" });
    const at2130 = new Date("2026-06-11T04:30:00Z");
    await runTick(t.db, portsAt(at2130), at2130);
    const mem1 = await getMemory(t.db, uid, "2026-06-10");
    expect(mem1?.status).toBe("ready");
    expect(mem1?.version).toBe(1);
    const box1 = await outbox(uid);
    expect(box1.some((r) => (r.payload as { tag: string }).tag === "day_ready")).toBe(true);

    // Late writer at 21:40 local.
    await insertMessage(t.db, { userId: uid, sender: "user", text: "one more thought before bed", clientId: newId(), localDate: "2026-06-10" });
    const at2140 = new Date("2026-06-11T04:40:00Z");
    await runTick(t.db, portsAt(at2140), at2140);
    const mem2 = await getMemory(t.db, uid, "2026-06-10");
    expect(mem2?.version).toBe(2);
    // day_ready is not sent twice.
    const box2 = await outbox(uid);
    expect(box2.filter((r) => (r.payload as { tag: string }).tag === "day_ready")).toHaveLength(1);
  });

  it("Kolkata & Auckland users still get their morning nudge under a once-a-day UTC tick", async () => {
    for (const tz of ["Asia/Kolkata", "Pacific/Auckland"]) {
      const uid = newId();
      await createProfile(t.db, uid, tz);
      await updateProfile(t.db, uid, { morningTime: "08:30" });
      await upsertPushSubscription(t.db, { userId: uid, endpoint: `local://${uid}`, p256dh: "x", auth: "y" });
      // Find a UTC instant that is ~09:00 local for each. Kolkata +5:30 -> 03:30 UTC; Auckland +12/+13 -> 20:00/21:00 UTC prev.
      const utc = tz === "Asia/Kolkata" ? new Date("2026-06-10T03:30:00Z") : new Date("2026-06-09T21:00:00Z");
      await runTick(t.db, portsAt(utc), utc);
      const box = await outbox(uid);
      expect(box.some((r) => (r.payload as { tag: string }).tag === "morning"), `${tz} morning`).toBe(true);
    }
  });

  it("an active journaler with no reminder times still gets evening synthesis", async () => {
    // Skipped rhythm setup (both times null) and the profile hasn't been touched in
    // days, but they keep journaling — recent message activity must keep them in the tick.
    const uid = newId();
    await createProfile(t.db, uid, "UTC");
    await t.db.update(profiles).set({ updatedAt: new Date("2026-06-05T00:00:00Z") }).where(eq(profiles.id, uid));
    await t.db.insert(messages).values({ userId: uid, sender: "user", kind: "text", text: "a calm afternoon in the sun", clientId: newId(), localDate: "2026-06-15", createdAt: new Date("2026-06-15T10:00:00Z") });
    const at = new Date("2026-06-15T22:00:00Z"); // 22:00 UTC, past the default evening time
    await runTick(t.db, portsAt(at), at);
    const mem = await getMemory(t.db, uid, "2026-06-15");
    expect(mem?.status).toBe("ready");
  });

  it("quiet hours suppress a default-time nudge at 23:30 local", async () => {
    const uid = newId();
    await createProfile(t.db, uid, "UTC");
    await updateProfile(t.db, uid, { morningTime: "23:30" }); // contrived: due window at 23:30 but quiet
    await upsertPushSubscription(t.db, { userId: uid, endpoint: `local://${uid}`, p256dh: "x", auth: "y" });
    const at = new Date("2026-06-10T23:30:00Z");
    await runTick(t.db, portsAt(at), at);
    const box = await outbox(uid);
    expect(box.filter((r) => (r.payload as { tag: string }).tag === "morning")).toHaveLength(0);
  });
});
