import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createProfile, getProfile, getTranscriptionKey, publicProfile, setTranscriptionKey } from "@/lib/db/repo/profiles";
import { UID_A, makeTestDb, type TestDb } from "../helpers/db";

let t: TestDb;
beforeAll(async () => {
  t = await makeTestDb();
  await createProfile(t.db, UID_A, "UTC");
});
afterAll(async () => {
  await t.close();
});

describe("BYO transcription key", () => {
  it("stores and reads the key server-side", async () => {
    await setTranscriptionKey(t.db, UID_A, "sk-secret-abc123");
    expect(await getTranscriptionKey(t.db, UID_A)).toBe("sk-secret-abc123");
  });

  it("publicProfile strips the key so it never reaches a client", async () => {
    const p = await getProfile(t.db, UID_A);
    expect(p?.transcriptionKey).toBe("sk-secret-abc123");
    const safe = publicProfile(p!);
    expect("transcriptionKey" in safe).toBe(false);
    expect(JSON.stringify(safe)).not.toContain("sk-secret-abc123");
  });

  it("clears the key on removal", async () => {
    await setTranscriptionKey(t.db, UID_A, null);
    expect(await getTranscriptionKey(t.db, UID_A)).toBeNull();
  });
});
