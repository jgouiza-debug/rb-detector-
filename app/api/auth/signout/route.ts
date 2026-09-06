import { getPorts } from "@/lib/ports";
import { json } from "@/lib/util/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await getPorts().auth.signOut();
  return json({ ok: true });
}
