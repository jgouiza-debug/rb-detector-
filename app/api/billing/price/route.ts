import { getEnv } from "@/lib/env";
import { getPorts } from "@/lib/ports";
import { json } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let cache: { label: string; at: number } | null = null;
const TTL = 60 * 60_000;

export async function GET() {
  const env = getEnv();
  if (cache && Date.now() - cache.at < TTL) return json({ label: cache.label });
  const price = await getPorts().billing.getPrice();
  const label = price?.label ?? env.billing.priceLabel;
  cache = { label, at: Date.now() };
  return json({ label });
}
