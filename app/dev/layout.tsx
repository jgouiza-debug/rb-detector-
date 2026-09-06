import { notFound } from "next/navigation";
import { getEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Gates every /dev page to local mode — in cloud these render a 404, matching the
 * devGuard on /api/dev routes so the mock checkout/portal never appear in production. */
export default function DevLayout({ children }: { children: React.ReactNode }) {
  if (getEnv().mode !== "local") notFound();
  return <>{children}</>;
}
