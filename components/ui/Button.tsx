import { cn } from "@/lib/util/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "strong" | "soft" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-cta text-cta-fg hover:brightness-95 active:brightness-90 shadow-sm",
  strong: "bg-ink text-cream hover:bg-ink/90",
  soft: "bg-surface-2 text-fg hover:brightness-95",
  ghost: "bg-transparent text-fg hover:bg-surface-2",
  danger: "bg-blush-ink text-cream hover:brightness-95",
};
const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-5 text-base",
  lg: "h-14 px-6 text-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  full,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; full?: boolean; children: ReactNode }) {
  return (
    <button
      className={cn(
        "tap inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-[filter,transform,background-color] duration-150 ease-soft active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none",
        variants[variant],
        sizes[size],
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
