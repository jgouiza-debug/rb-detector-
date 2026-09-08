import Link from "next/link";
import { BackLink } from "@/components/ui/BackLink";

export const metadata = { title: "about pip" };

export default function AboutPage() {
  return (
    <main id="main" className="pt-safe pb-safe mx-auto w-full max-w-md px-4 py-6">
      <BackLink href="/settings" className="mb-4">settings</BackLink>
      <h1 className="mb-4 font-display text-3xl">about pip</h1>
      <div className="space-y-4 text-base leading-relaxed text-fg">
        <p><strong>pip is a companion for reflection, not a therapist.</strong> pip doesn&apos;t diagnose anything and never gives medical or medication advice. if things get heavy, real help is always one tap away via <Link href="/help" className="underline">get help now</Link>.</p>
        <h2 className="font-display text-lg">your privacy</h2>
        <ul className="list-disc space-y-2 pl-6 text-fg-soft">
          <li>your data is encrypted in transit (TLS) and at rest (AES-256 on our provider).</li>
          <li>photos live in a private store and are only ever shown to you through an authenticated link — never a public URL. location data is stripped from every photo.</li>
          <li>no third-party analytics. the AI that helps write your memories is never trained on what you share.</li>
          <li>you can export everything or delete your account and every trace of it, any time, for free.</li>
        </ul>
        <p className="text-sm text-fg-soft">we don&apos;t claim end-to-end encryption, because it wouldn&apos;t be true. this is exactly what happens to your words.</p>
      </div>
    </main>
  );
}
