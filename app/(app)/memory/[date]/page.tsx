export const dynamic = "force-dynamic";
export const metadata = { title: "a memory" };

export default async function MemoryPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  return (
    <main className="pt-safe mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <h1 className="font-reading text-3xl">{date}</h1>
      <p className="text-fg-soft">this keepsake is coming together.</p>
    </main>
  );
}
