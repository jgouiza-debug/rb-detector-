import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createProfile } from "@/lib/db/repo/profiles";
import { insertMessage } from "@/lib/db/repo/messages";
import { UID_A, UID_B, makeTestDb, type TestDb } from "../helpers/db";

let t: TestDb;
beforeAll(async () => {
  t = await makeTestDb();
  // Seed as the service connection (pglite superuser bypasses RLS, like Supabase service role).
  await createProfile(t.db, UID_A, "UTC");
  await createProfile(t.db, UID_B, "UTC");
  await insertMessage(t.db, { userId: UID_A, sender: "user", text: "alpha private", localDate: "2026-10-26" });
  await insertMessage(t.db, { userId: UID_B, sender: "user", text: "beta private", localDate: "2026-10-26" });
});
afterAll(async () => {
  await t.close();
});

describe("row-level security (as authenticated user A)", () => {
  it("A reads only A's messages", async () => {
    const rows = await t.asUser(UID_A, async () => {
      const r = await t.raw.query<{ text: string }>(`select text from messages order by text`);
      return r.rows;
    });
    expect(rows.map((r) => r.text)).toEqual(["alpha private"]);
  });

  it("A cannot read B's profile", async () => {
    const rows = await t.asUser(UID_A, async () => (await t.raw.query<{ id: string }>(`select id from profiles`)).rows);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe(UID_A);
  });

  it("A cannot insert a row as B (no INSERT policy for authenticated)", async () => {
    await expect(
      t.asUser(UID_A, async () => {
        await t.raw.exec(`insert into messages (user_id, sender, kind, text, local_date) values ('${UID_B}', 'user', 'text', 'forged', '2026-10-26')`);
      }),
    ).rejects.toThrow(/row-level security/i);
  });

  it("A cannot read service-only tables (billing_events has RLS, no policy)", async () => {
    await t.raw.exec(`insert into billing_events (id, type, payload) values ('evt_x', 'checkout_completed', '{}'::jsonb)`);
    const rows = await t.asUser(UID_A, async () => (await t.raw.query(`select id from billing_events`)).rows);
    expect(rows).toHaveLength(0);
  });
});
