import Link from "next/link";
import { ArrowLeft, HeartHandshake, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { CRISIS_RESOURCES, EMERGENCY_NOTE } from "@/lib/safety/resources";

export const metadata = { title: "get help now" };

/** Public, unauthenticated, offline-precached. Reachable no matter the session state. */
export default function HelpPage() {
  return (
    <main id="main" className="pt-safe pb-safe mx-auto max-w-md px-5 py-6">
      <Link href="/thread" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-fg-soft">
        <Icon icon={ArrowLeft} size={16} /> back
      </Link>
      <h1 className="mb-1 flex items-center gap-2 font-display text-3xl">
        <Icon icon={HeartHandshake} size={26} /> you&apos;re not alone
      </h1>
      <p className="mb-5 text-fg-soft">pip is a companion, not a crisis service. if you&apos;re struggling, these are real people who can help, any time.</p>
      <ul className="flex flex-col gap-3">
        {CRISIS_RESOURCES.map((r) => (
          <li key={`${r.region}-${r.name}`} className="rounded-card bg-surface p-4">
            <div className="text-xs font-bold uppercase tracking-wide text-fg-soft">{r.region}</div>
            <div className="font-semibold">{r.name}</div>
            <div className="text-sm text-fg-soft">{r.detail}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {r.tel && <a href={`tel:${r.tel}`} className="tap inline-flex items-center gap-1.5 rounded-pill bg-cta px-3 py-2 text-sm font-semibold text-cta-fg"><Icon icon={Phone} size={16} /> call</a>}
              {r.sms && <a href={`sms:${r.sms}`} className="tap inline-flex items-center gap-1.5 rounded-pill bg-surface px-3 py-2 text-sm font-semibold text-fg ring-1 ring-line"><Icon icon={MessageSquare} size={16} /> text</a>}
              {r.href && <a href={r.href} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-pill bg-surface px-3 py-2 text-sm font-semibold text-fg ring-1 ring-line"><Icon icon={ExternalLink} size={16} /> open</a>}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-fg-soft">{EMERGENCY_NOTE}</p>
    </main>
  );
}
