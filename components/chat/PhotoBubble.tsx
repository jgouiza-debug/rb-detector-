"use client";
import Image from "next/image";
import { cn } from "@/lib/util/cn";
import { useThread, type UiMessage } from "@/lib/store/threadStore";

export function PhotoBubble({
  message,
  lastInGroup,
}: {
  message: UiMessage;
  lastInGroup: boolean;
}) {
  const retry = useThread((s) => s.retry);
  return (
    <div className={cn("flex w-full flex-col items-end gap-1")}>
      {/* Same status vocabulary as a text bubble: a pending photo dims, and a
          failed one gets a real retry affordance. Before this, a photo that
          failed to send was silent and unrecoverable while a failed text got a
          tap-to-retry. */}
      <div
        className={cn(
          "grid max-w-[80%] grid-cols-2 gap-1",
          message.status === "pending" && "opacity-70",
        )}
      >
        {message.media.map((m) => {
          // The bubble is a preview (~half-width, capped at 288px tall), so the
          // 480px thumb is the right source — pulling the 1600px full here was
          // multiple megabytes to render a thumbnail.
          const src = m.localUrl ?? `/api/media/${m.id}?v=thumb`;
          return (
            <div
              key={m.id}
              className={cn(
                "relative overflow-hidden rounded-card bg-surface-2",
                message.media.length === 1 && "col-span-2",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={m.caption ?? "your photo"}
                loading="lazy"
                decoding="async"
                className="h-full max-h-72 w-full object-cover"
              />
            </div>
          );
        })}
      </div>
      {message.text && (
        <div
          className={cn(
            "bubble-user max-w-[80%] bg-bubble-user px-4 py-2 text-base text-bubble-user-fg",
            message.status === "pending" && "opacity-70",
            !lastInGroup && "no-tail",
          )}
        >
          {message.text}
        </div>
      )}
      {message.status === "failed" && (
        <button
          type="button"
          onClick={() => retry((message.meta.clientId as string) ?? message.id)}
          className="tap mt-1 inline-flex items-center rounded-pill text-xs font-semibold text-fg underline decoration-blush-ink transition-colors duration-150 active:bg-line/40"
        >
          photo didn&apos;t send · tap to retry
        </button>
      )}
    </div>
  );
}

void Image;
