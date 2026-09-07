"use client";
import { HeartHandshake, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import type { CrisisCardData } from "@/lib/store/threadStore";

/**
 * Shown in the thread when someone signals real danger. Calm, warm, honest.
 * Layout is deliberate: the 988 call/text pair sits at the bottom of the card,
 * nearest the thumb, and every other resource is a single tappable row above it.
 */
export function CrisisCard({ card }: { card: CrisisCardData }) {
  const primary = card.resources.find((r) => r.tel) ?? card.resources[0];
  const rest = card.resources.filter((r) => r !== primary);
  return (
    <div className="my-2 w-full rounded-card border border-line bg-surface p-4 shadow-1 animate-fade-up" role="group" aria-labelledby="crisis-card-title">
      <div id="crisis-card-title" className="mb-2 flex items-center gap-2 font-display text-lg">
        <Icon icon={HeartHandshake} size={20} /> people who can help, right now
      </div>
      <p className="mb-4 text-sm text-fg-soft">{card.emergency}</p>

      <ul className="mb-4 flex flex-col divide-y divide-line rounded-2xl bg-surface-2">
        {rest.map((r) => {
          const href = r.tel ? `tel:${r.tel}` : r.sms ? `sms:${r.sms}` : r.href;
          const icon = r.tel ? Phone : r.sms ? MessageSquare : ExternalLink;
          return (
            <li key={`${r.region}-${r.name}`}>
              <a
                href={href}
                target={r.href && !r.tel && !r.sms ? "_blank" : undefined}
                rel={r.href && !r.tel && !r.sms ? "noopener noreferrer" : undefined}
                className="tap flex items-center gap-4 px-4 py-2 text-fg"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold uppercase tracking-wide text-fg-soft">{r.region}</span>
                  <span className="block text-sm font-semibold">{r.name} <span className="font-normal text-fg-soft">· {r.detail}</span></span>
                </span>
                <Icon icon={icon} size={18} className="shrink-0 text-fg-soft" />
              </a>
            </li>
          );
        })}
      </ul>

      {primary && (
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-soft">{primary.region} · {primary.name}</div>
          <div className="flex gap-2">
            {primary.tel && (
              <a href={`tel:${primary.tel}`} className="tap crisis-primary inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-pill bg-cta text-lg font-semibold text-cta-fg active:scale-[0.98]">
                <Icon icon={Phone} size={20} /> call {primary.tel}
              </a>
            )}
            {primary.sms && (
              <a href={`sms:${primary.sms}`} className="tap inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-pill bg-surface-2 text-lg font-semibold text-fg ring-1 ring-line active:scale-[0.98]">
                <Icon icon={MessageSquare} size={20} /> text {primary.sms}
              </a>
            )}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs italic text-fg-soft">{card.footer}</p>
    </div>
  );
}
