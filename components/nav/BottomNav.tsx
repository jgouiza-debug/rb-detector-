"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookHeart, MessageCircle } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/util/cn";

/**
 * The two places you can be: talking to Pip, and reading yourself back.
 * Design spec 2 asks for exactly these two and forbids a third.
 *
 * It sits at the bottom because the timeline is the payoff and it used to be
 * reachable only from an unlabelled icon at y≈52 — the hardest corner to hit
 * one-handed on the screen someone opens at 1am. Labels, not icons alone: a new
 * user should not have to guess which glyph is their own story.
 */
const ITEMS = [
  { href: "/thread", label: "pip", icon: MessageCircle },
  { href: "/timeline", label: "your story", icon: BookHeart },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="main" className="pb-safe border-t border-line/60 bg-bg">
      <ul className="mx-auto flex max-w-2xl items-stretch">
        {ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "tap flex h-14 w-full flex-col items-center justify-center gap-1 transition-colors duration-150 active:bg-surface",
                  active ? "text-fg" : "text-fg-soft",
                )}
              >
                <Icon icon={icon} size={20} />
                <span className="text-xs font-semibold">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
