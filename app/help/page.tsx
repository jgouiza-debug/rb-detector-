import { HeartHandshake, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { BackLink } from "@/components/ui/BackLink";
import { CRISIS_RESOURCES, EMERGENCY_NOTE } from "@/lib/safety/resources";

export const metadata = { title: "get help now" };

/** Public, unauthenticated, offline-precached. Reachable no matter the session state. */
export default function HelpPage() {
  const primary = CRISIS_RESOURCES.find((r) => r.tel) ?? CRISIS_RESOURCES[0];
  const rest = CRISIS_RESOURCES.filter((r) => r !== primary);
  return (
    <main id="main" className="pt-safe mx-auto flex min-h-[100dvh] w-full max-w-md flex-col px-4 py-6">
      <BackLink href="/thread" className="mb-4">back</BackLink>
      <h1 className="mb-2 flex items-center gap-2 font-display text-3xl">
        <Icon icon={HeartHandshake} size={28} /> you&apos;re not alone
      </h1>
      <p className="mb-6 text-fg-soft">pip is a companion, not a crisis service. if you&apos;re struggling, these are real people who can help, any time.</p>

      <ul className="flex flex-col divide-y divide-line rounded-card bg-surface">
        {rest.map((r) => {
          const href = r.tel ? `tel:${r.tel}` : r.sms ? `sms:${r.sms}` : r.href;
          const external = !r.tel && !r.sms && !!r.href;
          return (
            <li key={`${r.region}-${r.name}`}>
              <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="tap flex items-center gap-4 px-4 py-2 text-fg">
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wide text-fg-soft">{r.region}</span>
                  <span className="block font-semibold">{r.name}</span>
                  <span className="block text-sm text-fg-soft">{r.detail}</span>
                </span>
                <Icon icon={r.tel ? Phone : r.sms ? MessageSquare : ExternalLink} size={18} className="shrink-0 text-fg-soft" />
              </a>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-sm text-fg-soft">{EMERGENCY_NOTE}</p>

      <div className="pb-safe sticky bottom-0 mt-auto bg-bg pt-6">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-soft">{primary.region} · {primary.name}</div>
        <div className="flex gap-2 pb-2">
          {primary.tel && (
            <a href={`tel:${primary.tel}`} className="tap inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-pill bg-cta text-lg font-semibold text-cta-fg shadow-1 active:scale-[0.98]">
              <Icon icon={Phone} size={20} /> call {primary.tel}
            </a>
          )}
          {primary.sms && (
            <a href={`sms:${primary.sms}`} className="tap inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-pill bg-surface text-lg font-semibold text-fg ring-1 ring-line active:scale-[0.98]">
              <Icon icon={MessageSquare} size={20} /> text {primary.sms}
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
