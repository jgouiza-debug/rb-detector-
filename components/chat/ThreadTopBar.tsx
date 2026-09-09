"use client";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PipAvatar } from "@/components/pip/PipAvatar";
import { TopBar } from "@/components/ui/TopBar";

export function ThreadTopBar() {
  return (
    <TopBar
      left={
        <span className="flex items-center gap-2">
          <PipAvatar size={30} />
          <span className="font-display text-lg tracking-tight">pip</span>
        </span>
      }
      right={
        <Link
          href="/settings"
          aria-label="settings"
          className="tap flex items-center justify-center rounded-pill text-fg-soft transition-colors duration-150 hover:bg-surface-2 active:bg-line/40"
        >
          <Icon icon={Settings} size={20} />
        </Link>
      }
    />
  );
}
