"use client";
import Image from "next/image";
import { cn } from "@/lib/util/cn";
import type { UiMessage } from "@/lib/store/threadStore";

export function PhotoBubble({ message, lastInGroup }: { message: UiMessage; lastInGroup: boolean }) {
  return (
    <div className={cn("flex w-full flex-col items-end gap-1")}>
      <div className="grid max-w-[80%] grid-cols-2 gap-1">
        {message.media.map((m) => {
          const src = m.localUrl ?? `/api/media/${m.id}?v=full`;
          return (
            <div key={m.id} className={cn("relative overflow-hidden rounded-card bg-surface-2", message.media.length === 1 && "col-span-2")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={m.caption ?? "your photo"} className="h-full max-h-72 w-full object-cover" />
            </div>
          );
        })}
      </div>
      {message.text && (
        <div className={cn("bubble-user max-w-[80%] bg-bubble-user px-4 py-2 text-base text-bubble-user-fg", !lastInGroup && "no-tail")}>{message.text}</div>
      )}
    </div>
  );
}

void Image;
