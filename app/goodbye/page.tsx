import { PipMascot } from "@/components/pip/PipMascot";

export const metadata = { title: "goodbye" };

export default function GoodbyePage() {
  return (
    <main id="main" className="pt-safe mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <PipMascot expression="cozy" size={120} />
      <h1 className="font-display text-3xl">your words are gone from here</h1>
      <p className="text-fg-soft">everything you shared has been deleted. take good care of yourself.</p>
    </main>
  );
}
