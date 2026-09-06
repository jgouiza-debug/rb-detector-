import Link from "next/link";
import { PipMascot } from "@/components/pip/PipMascot";

export const metadata = { title: "offline" };

export default function OfflinePage() {
  return (
    <main id="main" className="pt-safe mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <PipMascot expression="cozy" size={120} />
      <h1 className="font-display text-3xl">we&apos;re offline</h1>
      <p className="text-fg-soft">no connection right now. your words are safe — they&apos;ll send when you&apos;re back.</p>
      <Link href="/pause" className="font-semibold text-fg underline underline-offset-4">take a breathing moment while you wait</Link>
    </main>
  );
}
