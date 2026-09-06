import { PipAvatar } from "@/components/pip/PipAvatar";

export function TypingDots() {
  return (
    <div className="flex items-end gap-2" aria-live="polite" aria-label="pip is typing">
      <PipAvatar size={28} expression="thinking" />
      <div className="bubble-pip flex items-center gap-1 bg-bubble-pip px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span key={i} className="animate-typing-dot inline-block size-2 rounded-full bg-fg-soft" style={{ animationDelay: `${i * 0.16}s` }} />
        ))}
      </div>
    </div>
  );
}
