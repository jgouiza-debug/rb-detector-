"use client";
import { useEffect } from "react";
import { useThread, type UiMessage } from "@/lib/store/threadStore";
import { BottomNav } from "@/components/nav/BottomNav";
import { ThreadTopBar } from "./ThreadTopBar";
import { MessageList } from "./MessageList";
import { Composer } from "./Composer";

export function Thread({
  initial,
  localDate,
}: {
  initial: UiMessage[];
  localDate: string;
}) {
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
      <main id="main" className="flex flex-1 flex-col">
        <h1 className="sr-only">your conversation with pip</h1>
        <MessageList />
      </main>
      {/* One bottom chrome, not two: the composer rests directly on the nav so
          the pair sticks as a single object and the safe-area inset is paid once,
          by whichever element is actually last. */}
      <div className="sticky bottom-0 z-20">
        <Composer localDate={localDate} />
        <BottomNav />
      </div>
    </div>
  );
}
