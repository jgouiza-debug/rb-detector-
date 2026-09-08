import { cn } from "@/lib/util/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-card bg-surface-2", className)} />;
}
