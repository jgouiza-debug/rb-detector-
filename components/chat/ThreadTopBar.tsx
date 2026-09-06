"use client";
import Link from "next/link";
import { LifeBuoy, Settings, Wind } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PipAvatar } from "@/components/pip/PipAvatar";
import { TopBar } from "@/components/ui/TopBar";

export function ThreadTopBar() {
  return (
    <TopBar
      left={
        <span className="flex items-center gap-2">
          <PipAvatar size={30} />
          <span className="font-display text-lg">pip</span>
        </span>
      }
      right={
        <>
          <Link href="/help" aria-label="get help now" className="tap flex items-center justify-center rounded-full text-fg-soft hover:bg-surface-2">
            <Icon icon={LifeBuoy} size={20} />
          </Link>
          <Link href="/pause" aria-label="breathing moment" className="tap flex items-center justify-center rounded-full text-fg-soft hover:bg-surface-2">
            <Icon icon={Wind} size={20} />
          </Link>
          <Link href="/settings" aria-label="settings" className="tap flex items-center justify-center rounded-full text-fg-soft hover:bg-surface-2">
            <Icon icon={Settings} size={20} />
          </Link>
        </>
      }
    />
  );
}
