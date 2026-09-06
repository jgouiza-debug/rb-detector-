import { NextResponse } from "next/server";
import { getPorts } from "@/lib/ports";
import type { Session } from "@/lib/ports/auth";

export function json(data: unknown, init?: number | ResponseInit): NextResponse {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data as object, responseInit);
}

export function jsonError(status: number, code: string, message?: string): NextResponse {
  return NextResponse.json({ error: code, message: message ?? code }, { status });
}

/** Resolve the session or return a 401 JSON response (never a redirect for API routes). */
export async function requireSession(): Promise<{ session: Session } | { response: NextResponse }> {
  const session = await getPorts().auth.getSession();
  if (!session) return { response: jsonError(401, "unauthorized", "sign in first") };
  return { session };
}
