"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Sparkles } from "lucide-react";
import { Icon } from "./Icon";
import { cn } from "@/lib/util/cn";

const items = [
  { href: "/thread", label: "Thread", icon: MessageCircle },
  { href: "/timeline", label: "Timeline", icon: Sparkles },
] as const;

export function BottomNav() {
  const path = usePathname();
  return (
    <nav aria-label="Primary" className="pb-safe sticky bottom-0 z-30 border-t border-line bg-bg/95 backdrop-blur-md">
      <ul className="mx-auto flex max-w-2xl items-center justify-around px-3 py-2">
        {items.map((it) => {
          const active = path === it.href || path.startsWith(`${it.href}/`) || (it.href === "/timeline" && path.startsWith("/memory"));
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "tap mx-auto flex w-fit items-center gap-2 rounded-pill px-5 py-2.5 text-sm font-bold transition-colors",
                  active ? "bg-cta text-cta-fg" : "text-fg-soft hover:text-fg",
                )}
              >
                <Icon icon={it.icon} size={18} />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
