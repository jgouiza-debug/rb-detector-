import { cn } from "@/lib/util/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "strong" | "soft" | "ghost" | "danger";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary:
    "bg-cta text-cta-fg hover:brightness-95 active:brightness-90 shadow-1",
  strong: "bg-fg text-bg hover:brightness-110",
  soft: "bg-surface-2 text-fg hover:brightness-95",
  ghost: "bg-transparent text-fg hover:bg-surface-2",
  danger: "bg-blush-ink text-danger-fg hover:brightness-95",
};
const sizes: Record<Size, string> = {
  sm: "h-11 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-6 text-lg",
};

/**
 * The button's look, exported so a <Link> that *is* the primary action on a
 * screen can wear it without a second definition drifting away from this one.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  full,
  className,
}: {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
} = {}): string {
  return cn(
    "tap inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-[filter,transform,background-color] duration-150 ease-soft active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none",
    variants[variant],
    sizes[size],
    full && "w-full",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  full,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      className={buttonClasses({ variant, size, full, className })}
      {...rest}
    >
      {children}
    </button>
  );
}
