import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import { AuthError, type AuthPort, type Session } from "@/lib/ports/auth";

async function serverClient() {
  const env = getEnv();
  const jar = await cookies();
  return createServerClient(env.auth.supabaseUrl as string, env.auth.supabaseAnonKey as string, {
    cookies: {
      getAll: () => jar.getAll().map((c) => ({ name: c.name, value: c.value })),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) jar.set(name, value, options);
        } catch {
          /* called from a Server Component render; proxy.ts refreshes instead */
        }
      },
    },
  });
}

let admin: SupabaseClient | null = null;
function adminClient(): SupabaseClient {
  if (admin) return admin;
  const env = getEnv();
  admin = createClient(env.auth.supabaseUrl as string, env.auth.supabaseServiceRoleKey as string, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return admin;
}

export function supabaseAuth(): AuthPort {
  return {
    async getSession(): Promise<Session | null> {
      const supabase = await serverClient();
      const { data } = await supabase.auth.getUser();
      const u = data.user;
      if (!u) return null;
      return { userId: u.id, email: u.email ?? null, isAnonymous: (u.is_anonymous ?? u.app_metadata?.provider === "anonymous") ?? false };
    },
    async signInAnonymously(): Promise<Session> {
      const supabase = await serverClient();
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error || !data.user) throw new AuthError(error?.message ?? "anon sign-in failed", "unknown");
      return { userId: data.user.id, email: null, isAnonymous: true };
    },
    async startEmailLink(email: string): Promise<void> {
      const supabase = await serverClient();
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw new AuthError(error.message, "unknown");
    },
    async verifyEmailLink(email: string, code: string): Promise<Session> {
      const supabase = await serverClient();
      const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email_change" });
      if (error || !data.user) throw new AuthError(error?.message ?? "invalid code", "invalid_code");
      return { userId: data.user.id, email: data.user.email ?? email, isAnonymous: false };
    },
    async startEmailSignIn(email: string): Promise<void> {
      const supabase = await serverClient();
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      if (error) throw new AuthError(error.message, error.message.toLowerCase().includes("not") ? "no_account" : "unknown");
    },
    async verifyEmailSignIn(email: string, code: string): Promise<Session> {
      const supabase = await serverClient();
      const { data, error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
      if (error || !data.user) throw new AuthError(error?.message ?? "invalid code", "invalid_code");
      return { userId: data.user.id, email: data.user.email ?? email, isAnonymous: false };
    },
    async attachEmail(userId: string, email: string): Promise<"attached" | "conflict"> {
      try {
        const { error } = await adminClient().auth.admin.updateUserById(userId, { email, email_confirm: true });
        if (error) return "conflict";
        return "attached";
      } catch {
        return "conflict";
      }
    },
    async signOut(): Promise<void> {
      const supabase = await serverClient();
      await supabase.auth.signOut();
    },
    async deleteAuthUser(userId: string): Promise<void> {
      await adminClient().auth.admin.deleteUser(userId);
    },
  };
}
