"use client";
import Link from "next/link";
import { PipMascot } from "@/components/pip/PipMascot";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <main
      id="main"
      className="pt-safe pb-safe mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <PipMascot expression="cozy" size={120} />
      <h1 className="font-display text-3xl">we&apos;re offline</h1>
      <p className="text-fg-soft">
        no connection right now. your words are safe — they&apos;ll send when
        you&apos;re back.
      </p>
      {/* The thing you actually want on this screen is another go at it, so that
          is the primary action rather than a 24px underlined link to elsewhere. */}
      <Button full className="mt-2" onClick={() => window.location.reload()}>
        try again
      </Button>
      <Link
        href="/help"
        className="tap inline-flex items-center justify-center rounded-pill px-4 text-sm font-semibold text-fg-soft transition-colors duration-150 hover:bg-surface active:bg-line/40"
      >
        if you need someone right now
      </Link>
    </main>
  );
}
