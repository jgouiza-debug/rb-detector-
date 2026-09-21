"use client";
import { useState } from "react";

/** iOS Safari has no beforeinstallprompt, so we show a gentle hint there. */
export function InstallHint() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
  const standalone = typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || ("standalone" in navigator && (navigator as unknown as { standalone: boolean }).standalone));
  if (!isIOS || standalone) return null;
  return (
    <div className="rounded-field bg-surface-2 p-4 text-sm text-fg-soft">
      to keep pip on your home screen: tap the share button, then <strong>add to home screen</strong>.{" "}
      <button onClick={() => setDismissed(true)} className="font-semibold text-fg underline">got it</button>
    </div>
  );
}
