import { cn } from "@/lib/util/cn";
import type { CSSProperties, ReactNode } from "react";

export function Pill({ children, className, style, dot }: { children: ReactNode; className?: string; style?: CSSProperties; dot?: string }) {
  return (
    <span
      style={style}
      className={cn("inline-flex items-center gap-2 rounded-pill px-2 py-1 text-xs font-bold tracking-wide", className ?? "bg-surface-2 text-fg")}
    >
      {dot && <span aria-hidden="true" className="inline-block size-1.5 rounded-pill" style={{ background: dot }} />}
      {children}
    </span>
  );
}
