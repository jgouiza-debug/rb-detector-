import Link from "next/link";
import { PipMascot } from "@/components/pip/PipMascot";

export const metadata = { title: "goodbye" };

export default function GoodbyePage() {
  return (
    <main id="main" className="pt-safe pb-safe mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <PipMascot expression="cozy" size={120} />
      <h1 className="font-display text-3xl">your words are gone from here</h1>
      <p className="text-fg-soft">everything you shared has been deleted. take good care of yourself.</p>
      {/* A screen with nothing to press is a dead end, and the account being gone
          is a reason to offer a door rather than to remove one. Starting over is
          the only honest thing left to offer, so it is the only thing offered. */}
      <Link
        href="/"
        className="tap mt-4 inline-flex items-center justify-center rounded-pill px-5 text-sm font-semibold text-fg-soft transition-colors duration-150 hover:bg-surface active:bg-line/40"
      >
        start again, whenever you want
      </Link>
    </main>
  );
}
