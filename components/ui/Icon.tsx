import type { LucideIcon, LucideProps } from "lucide-react";

/** Lucide icons with the brand's rounded, medium-weight look. */
export function Icon({ icon: I, size = 20, ...rest }: { icon: LucideIcon; size?: number } & Omit<LucideProps, "size">) {
  return <I size={size} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest} />;
}
