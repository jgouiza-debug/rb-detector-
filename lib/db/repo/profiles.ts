import { eq } from "drizzle-orm";
import type { Db, Tx } from "@/lib/db/client";
import { profiles, type Prefs, type Profile } from "@/lib/db/schema";

type Exec = Db | Tx;

export async function createProfile(db: Exec, id: string, timezone: string): Promise<Profile> {
  const rows = await db.insert(profiles).values({ id, timezone, isAnonymous: true }).onConflictDoNothing().returning();
  if (rows.length) return rows[0];
  const existing = await getProfile(db, id);
  if (!existing) throw new Error("failed to create profile");
  return existing;
}

export async function getProfile(db: Exec, id: string): Promise<Profile | null> {
  const rows = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getProfileByEmail(db: Exec, email: string): Promise<Profile | null> {
  const rows = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
  return rows[0] ?? null;
}

/** Strip server-only fields (the BYO transcription key) before sending to a client. */
export function publicProfile(p: Profile): Omit<Profile, "transcriptionKey"> {
  const { transcriptionKey: _omit, ...rest } = p;
  void _omit;
  return rest;
}

/** Store or clear the user's own transcription key. Never round-trips to the client. */
export async function setTranscriptionKey(db: Exec, id: string, key: string | null): Promise<void> {
  await db.update(profiles).set({ transcriptionKey: key, updatedAt: new Date() }).where(eq(profiles.id, id));
}

export async function getTranscriptionKey(db: Exec, id: string): Promise<string | null> {
  const rows = await db.select({ k: profiles.transcriptionKey }).from(profiles).where(eq(profiles.id, id)).limit(1);
  return rows[0]?.k ?? null;
}

export interface ProfilePatch {
  name?: string | null;
  focus?: string[];
  timezone?: string;
  morningTime?: string | null;
  eveningTime?: string | null;
  prefs?: Prefs;
  onboardedAt?: Date | null;
  careModeUntil?: Date | null;
  email?: string | null;
  isAnonymous?: boolean;
  needsEmailLink?: boolean;
}

export async function updateProfile(db: Exec, id: string, patch: ProfilePatch): Promise<Profile | null> {
  const rows = await db
    .update(profiles)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(profiles.id, id))
    .returning();
  return rows[0] ?? null;
}
