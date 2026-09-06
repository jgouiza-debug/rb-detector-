"use client";
import { useState } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/util/cn";
import { Icon } from "@/components/ui/Icon";
import { PipAvatar } from "@/components/pip/PipAvatar";
import type { UiMessage } from "@/lib/store/threadStore";
import { useThread } from "@/lib/store/threadStore";

export function Bubble({ message, lastInGroup }: { message: UiMessage; lastInGroup: boolean }) {
  const isUser = message.sender === "user";
  const isVoice = message.kind === "voice";
  const [showTime, setShowTime] = useState(false);
  const retry = useThread((s) => s.retry);
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <div className={cn("flex w-full items-end gap-2", isUser ? "justify-end" : "justify-start")}>
      {!isUser && <div className="w-7 shrink-0">{lastInGroup && <PipAvatar size={28} />}</div>}
      <div className={cn("flex max-w-[80%] flex-col", isUser ? "items-end" : "items-start")}>
        <button
          type="button"
          onClick={() => setShowTime((v) => !v)}
          className={cn(
            "animate-bubble-in whitespace-pre-wrap break-words px-4 py-2.5 text-left text-[15px] leading-snug",
            isVoice
              ? "bubble-user flex items-start gap-2 bg-surface-2 text-fg ring-1 ring-line"
              : isUser
                ? "bubble-user bg-bubble-user text-bubble-user-fg"
                : "bubble-pip bg-bubble-pip text-bubble-pip-fg",
            !lastInGroup && "no-tail",
            message.status === "pending" && "opacity-70",
          )}
        >
          {isVoice && <Icon icon={Mic} size={15} className="mt-0.5 shrink-0 text-fg-soft" />}
          <span>{message.text}</span>
        </button>
        {isVoice && <span className="mt-1 px-1 text-[11px] text-fg-soft">noted quietly · no reply</span>}
        {message.status === "failed" && (
          <button type="button" onClick={() => retry((message.meta.clientId as string) ?? message.id)} className="mt-1 text-xs font-semibold text-fg underline decoration-blush-ink">
            didn&apos;t send · tap to retry
          </button>
        )}
        {showTime && <span className="mt-1 px-1 text-[11px] text-fg-soft">{time}</span>}
      </div>
    </div>
  );
}
