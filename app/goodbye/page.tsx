import Link from "next/link";
import { PipMascot } from "@/components/pip/PipMascot";
import { buttonClasses } from "@/components/ui/Button";

export const metadata = { title: "goodbye" };

export default function GoodbyePage() {
  return (
    <main
      id="main"
      className="pt-safe pb-safe mx-auto flex min-h-[100dvh] w-full max-w-md flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <PipMascot expression="cozy" size={120} />
      <h1 className="font-display text-3xl">your words are gone from here</h1>
      <p className="text-fg-soft">
        everything you shared has been deleted. take good care of yourself.
      </p>
      {/* A screen with nothing to press is a dead end, and the account being gone
          is a reason to offer a door rather than to remove one. Two doors, both
          real: come back, or reach the people who can help — the resources are
          the one thing here that outlives the account. */}
      <div className="mt-4 flex w-full flex-col gap-2">
        <Link
          href="/"
          className={buttonClasses({ variant: "soft", full: true })}
        >
          start again, whenever you want
        </Link>
        <Link
          href="/help"
          className={buttonClasses({ variant: "ghost", full: true })}
        >
          if you need someone right now
        </Link>
      </div>
    </main>
  );
}
