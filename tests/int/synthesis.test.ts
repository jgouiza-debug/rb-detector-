import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createProfile, updateProfile } from "@/lib/db/repo/profiles";
import { insertMessage, setMessageSafety } from "@/lib/db/repo/messages";
import { getMemory } from "@/lib/db/repo/memories";
import { runDay } from "@/lib/synthesis/runDay";
import { scriptedAi } from "@/lib/adapters/ai/scripted";
import type { Ports } from "@/lib/ports";
import { UID_A, makeTestDb, type TestDb } from "../helpers/db";

let t: TestDb;
const ports = { clock: { now: () => new Date("2026-10-26T23:30:00Z") }, ai: scriptedAi(), blob: { async get() { return null; }, async put() {}, async deletePrefix() {} } } as unknown as Ports;

beforeAll(async () => {
  t = await makeTestDb();
  await createProfile(t.db, UID_A, "UTC");
});
afterAll(async () => {
  await t.close();
});

describe("daily synthesis", () => {
  it("creates a memory, is idempotent, and re-synthesizes when a new entry lands", async () => {
    await insertMessage(t.db, { userId: UID_A, sender: "user", text: "had a genuinely good day, felt proud", clientId: "s1", localDate: "2026-10-26" });
    const first = await runDay(t.db, ports, UID_A, "2026-10-26", "evening");
    expect(first.outcome).toBe("created");
    expect(first.firstForDate).toBe(true);
    const mem1 = await getMemory(t.db, UID_A, "2026-10-26");
    expect(mem1?.status).toBe("ready");
    expect(mem1?.version).toBe(1);

    // Same inputs -> skipped, no version bump.
    const second = await runDay(t.db, ports, UID_A, "2026-10-26", "evening");
    expect(second.outcome).toBe("skipped");

    // New entry -> re-synthesized, version 2.
    await insertMessage(t.db, { userId: UID_A, sender: "user", text: "and then a nice walk after dinner", clientId: "s2", localDate: "2026-10-26" });
    const third = await runDay(t.db, ports, UID_A, "2026-10-26", "evening");
    expect(third.outcome).toBe("updated");
    const mem2 = await getMemory(t.db, UID_A, "2026-10-26");
    expect(mem2?.version).toBe(2);
  });

  it("excludes crisis messages from synthesis input", async () => {
    const day = "2026-10-20";
    await insertMessage(t.db, { userId: UID_A, sender: "user", text: "a calm and ordinary morning", clientId: "c1", localDate: day });
    const crisisMsg = await insertMessage(t.db, { userId: UID_A, sender: "user", text: "i want to kill myself", clientId: "c2", localDate: day });
    await setMessageSafety(t.db, crisisMsg.id, "crisis");
    const res = await runDay(t.db, ports, UID_A, day, "manual");
    expect(res.outcome).toBe("created");
    const mem = await getMemory(t.db, UID_A, day);
    expect(mem?.entryCount).toBe(1); // only the non-crisis entry counted
  });

  it("returns empty for a day with no entries", async () => {
    const res = await runDay(t.db, ports, UID_A, "2026-01-01", "manual");
    expect(res.outcome).toBe("empty");
  });

  it("care mode changes the source hash so it re-synthesizes", async () => {
    const day = "2026-10-19";
    await insertMessage(t.db, { userId: UID_A, sender: "user", text: "a heavy day but i held on", clientId: "cm1", localDate: day });
    const before = await runDay(t.db, ports, UID_A, day, "manual");
    expect(before.outcome).toBe("created");
    await updateProfile(t.db, UID_A, { careModeUntil: new Date("2026-10-27T00:00:00Z") });
    const after = await runDay(t.db, ports, UID_A, day, "evening");
    expect(after.outcome).toBe("updated");
  });
});
