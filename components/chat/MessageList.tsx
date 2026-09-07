"use client";
import { useEffect, useRef } from "react";
import { decorate } from "@/lib/chat/grouping";
import { useThread } from "@/lib/store/threadStore";
import { Bubble } from "./Bubble";
import { PhotoBubble } from "./PhotoBubble";
import { TypingDots } from "./TypingDots";
import { DayDivider } from "./DayDivider";
import { SystemMoment } from "./SystemMoment";
import { CrisisCard } from "./CrisisCard";
import { PauseChip } from "./PauseChip";

export function MessageList() {
  const messages = useThread((s) => s.messages);
  const typing = useThread((s) => s.typing);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  const decorated = decorate(messages.map((m) => ({ id: m.id, sender: m.sender, createdAt: m.createdAt, localDate: m.localDate })));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-2 px-4 py-4" role="log" aria-label="conversation with pip">
      {messages.map((m, i) => {
        const d = decorated[i];
        return (
          <div key={m.id} className="flex flex-col gap-2">
            {d.showDayDivider && <DayDivider date={m.localDate} />}
            {m.sender === "system" ? (
              m.kind === "crisis" && m.crisis ? (
                <CrisisCard card={m.crisis} />
              ) : (
                <SystemMoment message={m} />
              )
            ) : m.kind === "photo" && m.media.length > 0 ? (
              <PhotoBubble message={m} lastInGroup={d.lastInGroup} />
            ) : (
              <Bubble message={m} lastInGroup={d.lastInGroup} />
            )}
          </div>
        );
      })}
      <PauseChip />
      {typing && <TypingDots />}
      <div ref={bottomRef} />
    </div>
  );
}
