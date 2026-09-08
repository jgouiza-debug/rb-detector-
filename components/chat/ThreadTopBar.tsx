"use client";
import Link from "next/link";
import { BookHeart, Settings } from "lucide-react";
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
        <>
          <Link href="/timeline" aria-label="your story" className="tap flex items-center justify-center rounded-full text-fg-soft hover:bg-surface-2">
            <Icon icon={BookHeart} size={20} />
          </Link>
          <Link href="/settings" aria-label="settings" className="tap flex items-center justify-center rounded-full text-fg-soft hover:bg-surface-2">
            <Icon icon={Settings} size={20} />
          </Link>
        </>
      }
    />
  );
}
