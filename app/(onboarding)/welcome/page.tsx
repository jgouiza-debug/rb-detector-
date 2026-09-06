import Link from "next/link";
import { PipMascot } from "@/components/pip/PipMascot";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default function WelcomePage() {
  return (
    <main id="main" className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <PipMascot expression="listening" size={140} />
      <div className="space-y-2">
        <h1 className="font-display text-4xl">hey, i&apos;m pip 🌱</h1>
        <p className="text-lg text-fg-soft">a place to put your thoughts down. no rules, just talk to me whenever.</p>
        <p className="text-sm text-fg-soft">i&apos;m a companion, not a therapist. if things ever get heavy, help is one tap away.</p>
      </div>
      <div className="flex w-full flex-col gap-3">
        <Button full size="lg">hey pip</Button>
        <Link href="/sign-in" className="text-sm font-semibold text-fg-soft underline underline-offset-4">
          already have pip? sign in
        </Link>
      </div>
    </main>
  );
}
