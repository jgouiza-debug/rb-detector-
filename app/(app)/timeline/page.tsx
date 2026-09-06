export const dynamic = "force-dynamic";
export const metadata = { title: "Your Story" };

export default function Page() {
  return (
    <main className="pt-safe mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <h1 className="font-display text-3xl">Your Story</h1>
      <p className="text-fg-soft">your timeline is coming together. keep talking to pip — your first keepsake arrives tonight.</p>
    </main>
  );
}
