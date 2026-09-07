import { PipAvatar } from "@/components/pip/PipAvatar";

export function TypingDots() {
  return (
    <div className="flex items-end gap-2" role="status" aria-label="pip is typing">
      <PipAvatar size={32} expression="thinking" />
      <div className="bubble-pip flex min-h-11 items-center gap-1 bg-bubble-pip px-4 py-2 ring-1 ring-line/70">
        {[0, 1, 2].map((i) => (
          <span key={i} className="animate-typing-dot inline-block size-2 rounded-full bg-fg-soft" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </div>
    </div>
  );
}
