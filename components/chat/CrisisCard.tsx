"use client";
import { HeartHandshake, Phone, MessageSquare, ExternalLink } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import type { CrisisCardData } from "@/lib/store/threadStore";

export function CrisisCard({ card }: { card: CrisisCardData }) {
  return (
    <div className="mx-auto my-2 w-full max-w-[92%] rounded-card border border-line bg-surface p-4 shadow-sm animate-fade-up" role="group" aria-label="crisis resources">
      <div className="mb-3 flex items-center gap-2 font-display text-lg">
        <Icon icon={HeartHandshake} size={20} /> people who can help, right now
      </div>
      <ul className="flex flex-col gap-2">
        {card.resources.map((r) => (
          <li key={`${r.region}-${r.name}`} className="rounded-2xl bg-surface-2 p-3">
            <div className="text-xs font-bold uppercase tracking-wide text-fg-soft">{r.region}</div>
            <div className="font-semibold text-fg">{r.name}</div>
            <div className="text-sm text-fg-soft">{r.detail}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {r.tel && (
                <a href={`tel:${r.tel}`} className="tap inline-flex items-center gap-1.5 rounded-pill bg-cta px-3 py-2 text-sm font-semibold text-cta-fg">
                  <Icon icon={Phone} size={16} /> call
                </a>
              )}
              {r.sms && (
                <a href={`sms:${r.sms}`} className="tap inline-flex items-center gap-1.5 rounded-pill bg-surface px-3 py-2 text-sm font-semibold text-fg ring-1 ring-line">
                  <Icon icon={MessageSquare} size={16} /> text
                </a>
              )}
              {r.href && (
                <a href={r.href} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-pill bg-surface px-3 py-2 text-sm font-semibold text-fg ring-1 ring-line">
                  <Icon icon={ExternalLink} size={16} /> open
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-fg-soft">{card.emergency}</p>
      <p className="mt-2 text-xs italic text-fg-soft">{card.footer}</p>
    </div>
  );
}
