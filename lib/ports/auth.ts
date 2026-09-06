export interface Session {
  userId: string;
  email: string | null;
  isAnonymous: boolean;
}

export interface AuthPort {
  /** Resolve the current request's session from cookies (null when signed out). */
  getSession(): Promise<Session | null>;
  /** Create an anonymous user and set the session cookies. */
  signInAnonymously(): Promise<Session>;
  /** Anonymous -> permanent: send a 6-digit code to the address. */
  startEmailLink(email: string): Promise<void>;
  verifyEmailLink(email: string, code: string): Promise<Session>;
  /** Returning user on a new device. */
  startEmailSignIn(email: string): Promise<void>;
  verifyEmailSignIn(email: string, code: string): Promise<Session>;
  /** Admin: attach a verified email to a user (used right after checkout). */
  attachEmail(userId: string, email: string): Promise<"attached" | "conflict">;
  signOut(): Promise<void>;
  /** Admin: delete the auth user (account deletion). */
  deleteAuthUser(userId: string): Promise<void>;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: "invalid_code" | "expired" | "no_account" | "rate_limited" | "unknown" = "unknown",
  ) {
    super(message);
    this.name = "AuthError";
  }
}
