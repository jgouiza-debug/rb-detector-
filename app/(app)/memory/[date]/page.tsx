import { getEnv } from "@/lib/env";
import { requireSessionRedirect } from "@/lib/util/session";
import { MemoryDetail } from "@/components/timeline/MemoryDetail";

export const dynamic = "force-dynamic";
export const metadata = { title: "a memory" };

export default async function MemoryPage({ params }: { params: Promise<{ date: string }> }) {
  await requireSessionRedirect();
  const { date } = await params;
  return <MemoryDetail date={date} priceLabel={getEnv().billing.priceLabel} />;
}
