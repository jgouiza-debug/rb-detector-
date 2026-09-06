"use client";
import Link from "next/link";
import { Wind } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { useThread } from "@/lib/store/threadStore";

export function PauseChip() {
  const offer = useThread((s) => s.offerBreathe);
  const dismiss = useThread((s) => s.dismissBreathe);
  if (!offer) return null;
  return (
    <div className="flex justify-start pl-9">
      <Link
        href="/pause"
        onClick={dismiss}
        className="tap inline-flex items-center gap-2 rounded-pill bg-sky px-4 py-2 text-sm font-semibold text-ink animate-fade-up"
      >
        <Icon icon={Wind} size={16} /> want to slow down for a sec?
      </Link>
    </div>
  );
}
