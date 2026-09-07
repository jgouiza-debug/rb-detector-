import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { requireSessionRedirect } from "@/lib/util/session";
import { TranscriptionKeyField } from "@/components/settings/TranscriptionKeyField";

export const dynamic = "force-dynamic";
export const metadata = { title: "voice & dictation" };

export default async function VoicePage() {
  await requireSessionRedirect();
  return (
    <main className="pt-safe pb-safe mx-auto max-w-md px-5 py-6">
      <Link href="/settings" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-soft"><Icon icon={ArrowLeft} size={16} /> settings</Link>
      <h1 className="mb-1 font-display text-3xl">voice &amp; dictation</h1>
      <p className="mb-4 text-fg-soft">
        by default, dictation runs on your device for free. if your browser can&apos;t dictate, add your own transcription key (any OpenAI-compatible endpoint) and voice notes transcribe through it instead. your key is stored server-side and never shown again.
      </p>
      <TranscriptionKeyField />
    </main>
  );
}
