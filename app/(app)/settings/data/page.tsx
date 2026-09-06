import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { requireSessionRedirect } from "@/lib/util/session";
import { DangerZone } from "@/components/settings/DangerZone";
import { ExportButton } from "@/components/settings/ExportButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "your data" };

export default async function DataPage() {
  await requireSessionRedirect();
  return (
    <main className="pt-safe pb-safe mx-auto max-w-md px-5 py-6">
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-soft"><Icon icon={ArrowLeft} size={16} /> settings</Link>
      <h1 className="mb-1 font-display text-3xl">your data</h1>
      <p className="mb-5 text-fg-soft">it&apos;s yours, completely. take it with you or erase it, any time — free.</p>
      <div className="rounded-card bg-surface p-4">
        <h2 className="font-semibold">export everything</h2>
        <p className="mt-1 text-sm text-fg-soft">a zip with every message, memory, and photo, plus a readable story.</p>
        <ExportButton />
      </div>
      <div className="mt-6 rounded-card border border-blush/40 p-4">
        <h2 className="font-semibold text-blush-ink">delete account</h2>
        <p className="mb-3 mt-1 text-sm text-fg-soft">removes your account and everything in it, permanently.</p>
        <DangerZone />
      </div>
    </main>
  );
}
