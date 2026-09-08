import type { ReactNode } from "react";
import { cn } from "@/lib/util/cn";

export function TopBar({ left, center, right, className }: { left?: ReactNode; center?: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <header className={cn("pt-safe sticky top-0 z-30 bg-bg", className)}>
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-2 px-4">
        <div className="flex min-w-11 items-center gap-2">{left}</div>
        <div className="flex flex-1 items-center justify-center gap-2 truncate">{center}</div>
        <div className="flex min-w-11 items-center justify-end gap-1">{right}</div>
      </div>
    </header>
  );
}
