"use client";
import Link from "next/link";
import { LifeBuoy, Moon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import type { UiMessage } from "@/lib/store/threadStore";

export function SystemMoment({ message }: { message: UiMessage }) {
  if (message.kind === "day_ready") {
    const date = (message.meta.memoryDate as string) ?? message.localDate;
    return (
      <Link href={`/memory/${date}`} className="mx-auto my-2 flex items-center gap-2 rounded-pill bg-surface-2 px-4 py-2 text-sm font-semibold text-fg animate-fade-up">
        <Icon icon={Moon} size={16} /> your day is ready to look back on
      </Link>
    );
  }
  if (message.kind === "pause_done") {
    return <p className="mx-auto my-2 text-center text-sm text-fg-soft">🌿 {message.text}</p>;
  }
  // note
  return (
    <div className="mx-auto my-2 flex max-w-[90%] items-start gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-sm text-fg-soft">
      <Icon icon={LifeBuoy} size={16} />
      <span>
        {message.text} <Link href="/help" className="font-semibold text-fg underline">get help now</Link>
      </span>
    </div>
  );
}
