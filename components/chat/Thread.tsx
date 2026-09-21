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
  const crisisActive = useThread((s) => s.crisisActive);
  const resumeFromCrisis = useThread((s) => s.resumeFromCrisis);

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
      {/* While a crisis is active the casual chrome is gone — no composer inviting
          more typing, no nav offering a tab to wander into — and the only thing
          under the resources is a quiet way back, taken when the person is ready.
          The resources themselves sit above in the message list. */}
      {crisisActive ? (
        <div className="pb-safe px-safe sticky bottom-0 z-20 border-t border-line bg-bg">
          <div className="mx-auto max-w-2xl px-4 py-3">
            <button
              type="button"
              onClick={resumeFromCrisis}
              className="tap flex w-full items-center justify-center rounded-pill px-4 text-sm font-semibold text-fg-soft transition-colors duration-150 hover:bg-surface active:bg-line/40"
            >
              when you&apos;re ready, keep writing here
            </button>
          </div>
        </div>
      ) : (
        // One bottom chrome, not two: the composer rests directly on the nav so
        // the pair sticks as a single object and the safe-area inset is paid once,
        // by whichever element is actually last.
        <div className="sticky bottom-0 z-20">
          <Composer localDate={localDate} />
          <BottomNav />
        </div>
      )}
    </div>
  );
}
