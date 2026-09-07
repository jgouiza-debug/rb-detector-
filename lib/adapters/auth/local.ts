import { cookies } from "next/headers";
import { and, eq, gt } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { localOtps, profiles } from "@/lib/db/schema";
import { getEnv } from "@/lib/env";
import { AuthError, type AuthPort, type Session } from "@/lib/ports/auth";
import { hmac, newId, safeEqual } from "@/lib/util/ids";

const COOKIE = "pip_session";
const LOCAL_CODE = "000000";

function sign(userId: string): string {
  return `${userId}.${hmac(getEnv().auth.localSecret, userId)}`;
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot < 0) return null;
  const userId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  return safeEqual(sig, hmac(getEnv().auth.localSecret, userId)) ? userId : null;
}

async function setCookie(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365, secure: getEnv().mode !== "local" });
}

/** Local dev auth: HMAC-signed cookie session, OTP always accepts 000000. Mirrors the Supabase adapter's surface. */
export function localAuth(): AuthPort {
  return {
    async getSession(): Promise<Session | null> {
      const jar = await cookies();
      const userId = verify(jar.get(COOKIE)?.value);
      if (!userId) return null;
      const db = await getDb();
      const rows = await db.select({ email: profiles.email, isAnonymous: profiles.isAnonymous }).from(profiles).where(eq(profiles.id, userId)).limit(1);
      if (rows.length === 0) return { userId, email: null, isAnonymous: true };
      return { userId, email: rows[0].email, isAnonymous: rows[0].isAnonymous };
    },
    async signInAnonymously(): Promise<Session> {
      const userId = newId();
      await setCookie(userId);
      return { userId, email: null, isAnonymous: true };
    },
    async startEmailLink(email: string): Promise<void> {
      const db = await getDb();
      const jar = await cookies();
      const userId = verify(jar.get(COOKIE)?.value);
      await db
        .insert(localOtps)
        .values({ email, code: LOCAL_CODE, purpose: "link", userId, expiresAt: new Date(Date.now() + 15 * 60_000) })
        .onConflictDoUpdate({ target: localOtps.email, set: { code: LOCAL_CODE, purpose: "link", userId, expiresAt: new Date(Date.now() + 15 * 60_000) } });
    },
    async verifyEmailLink(email: string, code: string): Promise<Session> {
      const db = await getDb();
      const jar = await cookies();
      const userId = verify(jar.get(COOKIE)?.value);
      if (!userId) throw new AuthError("no session to link", "unknown");
      const rows = await db.select().from(localOtps).where(and(eq(localOtps.email, email), gt(localOtps.expiresAt, new Date()))).limit(1);
      if (rows.length === 0) throw new AuthError("expired code", "expired");
      if (rows[0].code !== code) throw new AuthError("wrong code", "invalid_code");
      await db.update(profiles).set({ email, isAnonymous: false, needsEmailLink: false, updatedAt: new Date() }).where(eq(profiles.id, userId));
      await db.delete(localOtps).where(eq(localOtps.email, email));
      return { userId, email, isAnonymous: false };
    },
    async startEmailSignIn(email: string): Promise<void> {
      const db = await getDb();
      const existing = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
      if (existing.length === 0) throw new AuthError("no account for that email", "no_account");
      await db
        .insert(localOtps)
        .values({ email, code: LOCAL_CODE, purpose: "signin", userId: existing[0].id, expiresAt: new Date(Date.now() + 15 * 60_000) })
        .onConflictDoUpdate({ target: localOtps.email, set: { code: LOCAL_CODE, purpose: "signin", userId: existing[0].id, expiresAt: new Date(Date.now() + 15 * 60_000) } });
    },
    async verifyEmailSignIn(email: string, code: string): Promise<Session> {
      const db = await getDb();
      const rows = await db.select().from(localOtps).where(and(eq(localOtps.email, email), gt(localOtps.expiresAt, new Date()))).limit(1);
      if (rows.length === 0) throw new AuthError("expired code", "expired");
      if (rows[0].code !== code) throw new AuthError("wrong code", "invalid_code");
      const userId = rows[0].userId;
      if (!userId) throw new AuthError("no account", "no_account");
      await setCookie(userId);
      await db.delete(localOtps).where(eq(localOtps.email, email));
      const p = await db.select({ email: profiles.email }).from(profiles).where(eq(profiles.id, userId)).limit(1);
      return { userId, email: p[0]?.email ?? email, isAnonymous: false };
    },
    async attachEmail(userId: string, email: string): Promise<"attached" | "conflict"> {
      const db = await getDb();
      const clash = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email)).limit(1);
      if (clash.length > 0 && clash[0].id !== userId) {
        await db.update(profiles).set({ needsEmailLink: true, updatedAt: new Date() }).where(eq(profiles.id, userId));
        return "conflict";
      }
      await db.update(profiles).set({ email, isAnonymous: false, needsEmailLink: false, updatedAt: new Date() }).where(eq(profiles.id, userId));
      return "attached";
    },
    async signOut(): Promise<void> {
      const jar = await cookies();
      jar.delete(COOKIE);
    },
    async deleteAuthUser(): Promise<void> {
      const jar = await cookies();
      jar.delete(COOKIE);
    },
  };
}
