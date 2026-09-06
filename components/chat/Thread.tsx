"use client";
import { useEffect } from "react";
import { useThread, type UiMessage } from "@/lib/store/threadStore";
import { ThreadTopBar } from "./ThreadTopBar";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";

export function Thread({ initial, localDate }: { initial: UiMessage[]; localDate: string }) {
  const setMessages = useThread((s) => s.setMessages);
  const pollCaptions = useThread((s) => s.pollCaptions);

  useEffect(() => {
    setMessages(initial);
  }, [initial, setMessages]);

  useEffect(() => {
    const t1 = setTimeout(pollCaptions, 3000);
    const t2 = setTimeout(pollCaptions, 10000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pollCaptions]);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <ThreadTopBar />
      <div className="flex flex-1 flex-col">
        <MessageList />
      </div>
      <Composer localDate={localDate} />
    </div>
  );
}
