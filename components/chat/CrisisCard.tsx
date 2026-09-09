"use client";
import { useId } from "react";
import { HeartHandshake } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import {
  PrimaryResource,
  ResourceRows,
} from "@/components/safety/ResourceList";
import type { CrisisCardData } from "@/lib/store/threadStore";

/**
 * Shown in the thread when someone signals real danger. Calm, warm, honest.
 * The 988 pair sits at the bottom, nearest the thumb; every other resource is
 * a single tappable row above it, drawn by the same component the help page uses.
 */
export function CrisisCard({ card }: { card: CrisisCardData }) {
  const primary = card.resources.find((r) => r.tel) ?? card.resources[0];
  const rest = card.resources.filter((r) => r !== primary);
  // A fixed literal id collides the moment a person has two crisis cards in one
  // thread — and someone in a bad stretch will. Per-instance keeps the
  // aria-labelledby pointing at this card's own heading.
  const titleId = useId();
  return (
    <div
      className="my-2 w-full rounded-card border border-line bg-surface p-4 shadow-1 animate-fade-up"
      role="group"
      aria-labelledby={titleId}
    >
      <div
        id={titleId}
        className="mb-2 flex items-center gap-2 font-display text-lg"
      >
        <Icon icon={HeartHandshake} size={20} /> people who can help, right now
      </div>
      <p className="mb-4 text-sm text-fg-soft">{card.emergency}</p>
      <div className="mb-4">
        <ResourceRows resources={rest} />
      </div>
      {primary && <PrimaryResource resource={primary} />}
      <p className="mt-4 text-xs italic text-fg-soft">{card.footer}</p>
    </div>
  );
}
