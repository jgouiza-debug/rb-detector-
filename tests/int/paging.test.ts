import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createProfile } from "@/lib/db/repo/profiles";
import { insertMessage, pageMessages } from "@/lib/db/repo/messages";
import type { Message } from "@/lib/db/schema";
import { UID_A, makeTestDb, type TestDb } from "../helpers/db";

let t: TestDb;
beforeAll(async () => {
  t = await makeTestDb();
  await createProfile(t.db, UID_A, "UTC");
});
afterAll(async () => {
  await t.close();
});

/** Walk the whole thread the way buildExportZip does: backward by the (createdAt, id) cursor. */
async function pageEverything(limit: number): Promise<Message[]> {
  const out: Message[] = [];
  let before: Date | undefined;
  let beforeId: string | undefined;
  for (let i = 0; i < 1000; i++) {
    const chunk = await pageMessages(t.db, UID_A, { before, beforeId, limit });
    if (chunk.length === 0) break;
    out.unshift(...chunk);
    before = chunk[0].createdAt;
    beforeId = chunk[0].id;
    if (chunk.length < limit) break;
  }
  return out;
}

describe("pageMessages keyset cursor", () => {
  it("pages 650 rows that ALL share one timestamp with no drop or duplicate", async () => {
    // The hardest case for the id tiebreaker: createdAt gives no ordering at
    // all, so a page boundary that lands mid-run must be carried purely by id.
    const shared = new Date("2026-05-01T12:00:00.000Z");
    const ids: string[] = [];
    for (let i = 0; i < 650; i++) {
      const m = await insertMessage(t.db, { userId: UID_A, sender: i % 2 ? "pip" : "user", kind: "text", text: `m${i}`, localDate: "2026-05-01", createdAt: shared });
      ids.push(m.id);
    }
    const paged = await pageEverything(100);
    const pagedIds = paged.map((m) => m.id);
    expect(pagedIds).toHaveLength(650);
    expect(new Set(pagedIds).size).toBe(650); // no duplicates across boundaries
    expect(new Set(pagedIds)).toEqual(new Set(ids)); // no drops
    // Global order is stable and strictly descending by id within the run.
    for (let i = 1; i < paged.length; i++) {
      expect(paged[i].id > paged[i - 1].id).toBe(true);
    }
  });

  it("pages rows with colliding-timestamp runs straddling boundaries", async () => {
    const t2 = await makeTestDb();
    await createProfile(t2.db, UID_A, "UTC");
    const base = new Date("2026-06-01T00:00:00.000Z").getTime();
    const ids: string[] = [];
    // Runs of 7 identical timestamps; limit 40 is not a multiple of 7, so every
    // boundary falls inside a run.
    for (let i = 0; i < 300; i++) {
      const createdAt = new Date(base + Math.floor(i / 7) * 1000);
      const m = await insertMessage(t2.db, { userId: UID_A, sender: "user", kind: "text", text: `n${i}`, localDate: "2026-06-01", createdAt });
      ids.push(m.id);
    }
    const out: Message[] = [];
    let before: Date | undefined;
    let beforeId: string | undefined;
    for (let i = 0; i < 1000; i++) {
      const chunk = await pageMessages(t2.db, UID_A, { before, beforeId, limit: 40 });
      if (chunk.length === 0) break;
      out.unshift(...chunk);
      before = chunk[0].createdAt;
      beforeId = chunk[0].id;
      if (chunk.length < 40) break;
    }
    expect(out).toHaveLength(300);
    expect(new Set(out.map((m) => m.id)).size).toBe(300);
    // Ascending by (createdAt, id) after the per-page reverse + unshift.
    for (let i = 1; i < out.length; i++) {
      const a = out[i - 1];
      const b = out[i];
      const order = a.createdAt.getTime() - b.createdAt.getTime() || (a.id < b.id ? -1 : 1);
      expect(order).toBeLessThan(0);
    }
    await t2.close();
  });
});
