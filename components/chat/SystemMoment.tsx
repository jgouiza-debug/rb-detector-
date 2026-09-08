"use client";
import Link from "next/link";
import { LifeBuoy, Moon } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import type { UiMessage } from "@/lib/store/threadStore";

export function SystemMoment({ message }: { message: UiMessage }) {
  if (message.kind === "day_ready") {
    const date = (message.meta.memoryDate as string) ?? message.localDate;
    return (
      <Link href={`/memory/${date}`} className="tap mx-auto my-2 flex items-center gap-2 rounded-pill bg-surface-2 px-4 py-2 text-sm font-semibold text-fg animate-fade-up">
        <Icon icon={Moon} size={16} /> your day is ready to look back on
      </Link>
    );
  }
  if (message.kind === "pause_done") {
    return <p className="mx-auto my-2 text-center text-sm text-fg-soft">{message.text}</p>;
  }
  // note
  return (
    <div className="mx-auto my-2 flex w-full max-w-[90%] flex-col gap-2 rounded-2xl bg-surface-2 p-4 text-sm text-fg-soft">
      <span className="flex items-start gap-2">
        <Icon icon={LifeBuoy} size={16} className="mt-1 shrink-0" />
        <span>{message.text}</span>
      </span>
      <Link href="/help" className="tap -mb-2 -ml-2 inline-flex w-fit items-center gap-1 rounded-pill px-2 font-semibold text-fg hover:bg-surface">
        get help now →
      </Link>
    </div>
  );
}
