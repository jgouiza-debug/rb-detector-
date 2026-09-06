"use client";
import { cn } from "@/lib/util/cn";
import type { ReactNode } from "react";

export function Chip({
  selected,
  onClick,
  children,
  className,
  role = "button",
}: {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  role?: "button" | "radio" | "checkbox";
}) {
  const pressedProps = role === "button" ? { "aria-pressed": !!selected } : { "aria-checked": !!selected, role };
  return (
    <button
      type="button"
      onClick={onClick}
      {...pressedProps}
      className={cn(
        "tap inline-flex items-center gap-1.5 rounded-pill border px-4 py-2 text-sm font-semibold transition-colors duration-150",
        selected ? "bg-ink text-cream border-ink" : "bg-surface text-fg border-line hover:bg-surface-2",
        className,
      )}
    >
      {children}
    </button>
  );
}
