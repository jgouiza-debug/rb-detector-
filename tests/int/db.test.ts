import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createProfile, getProfile, updateProfile } from "@/lib/db/repo/profiles";
import { countUserEntriesForDate, insertMessage, messagesForDate } from "@/lib/db/repo/messages";
import { UID_A, UID_B, makeTestDb, type TestDb } from "../helpers/db";

let t: TestDb;
beforeAll(async () => {
  t = await makeTestDb();
});
afterAll(async () => {
  await t.close();
});

describe("migrations + repositories (pglite)", () => {
  it("applies all migrations and round-trips a profile", async () => {
    const p = await createProfile(t.db, UID_A, "America/New_York");
    expect(p.id).toBe(UID_A);
    expect(p.isAnonymous).toBe(true);
    const patched = await updateProfile(t.db, UID_A, { name: "Sam", focus: ["processing a lot"], morningTime: "08:30" });
    expect(patched?.name).toBe("Sam");
    expect(patched?.focus).toEqual(["processing a lot"]);
    const got = await getProfile(t.db, UID_A);
    expect(got?.morningTime).toBe("08:30");
  });

  it("client_id makes message inserts idempotent", async () => {
    await createProfile(t.db, UID_B, "UTC");
    const m1 = await insertMessage(t.db, { userId: UID_B, sender: "user", text: "hello", clientId: "c-1", localDate: "2026-10-26" });
    const m2 = await insertMessage(t.db, { userId: UID_B, sender: "user", text: "hello (retry)", clientId: "c-1", localDate: "2026-10-26" });
    expect(m2.id).toBe(m1.id);
    expect(m2.text).toBe("hello");
    const forDate = await messagesForDate(t.db, UID_B, "2026-10-26");
    expect(forDate).toHaveLength(1);
    expect(await countUserEntriesForDate(t.db, UID_B, "2026-10-26")).toBe(1);
  });
});
