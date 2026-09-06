import { redirect } from "next/navigation";
import { getPorts } from "@/lib/ports";
import type { Session } from "@/lib/ports/auth";

/** Server-component session guard that redirects to /welcome when signed out. */
export async function requireSessionRedirect(): Promise<Session> {
  const session = await getPorts().auth.getSession();
  if (!session) redirect("/welcome");
  return session;
}
