import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
import { cn } from "@/lib/util/cn";

/** The one way back. A full 44px tap target whose text still sits on the page's left column. */
export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "tap -ml-2 inline-flex w-fit items-center gap-1 self-start rounded-pill px-2 text-sm font-semibold text-fg-soft transition-colors duration-150 hover:bg-surface-2 active:bg-line/40",
        className,
      )}
    >
      <Icon icon={ArrowLeft} size={16} /> {children}
    </Link>
  );
}
