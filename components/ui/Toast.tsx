"use client";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/util/cn";

interface ToastItem {
  id: number;
  text: string;
  tone: "default" | "warm";
}
const Ctx = createContext<{ toast: (text: string, tone?: ToastItem["tone"]) => void }>({ toast: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(1);
  const toast = useCallback((text: string, tone: ToastItem["tone"] = "default") => {
    const id = idRef.current++;
    setItems((s) => [...s, { id, text, tone }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3600);
  }, []);
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-3 z-50 flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            className={cn(
              "animate-fade-up rounded-pill px-4 py-2.5 text-sm font-semibold shadow-2",
              t.tone === "warm" ? "bg-sunlight text-ink" : "bg-ink text-cream",
            )}
          >
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
