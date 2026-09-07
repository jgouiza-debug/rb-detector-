import Link from "next/link";
import { MessageCircle, Settings } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PipAvatar } from "@/components/pip/PipAvatar";
import { TopBar } from "@/components/ui/TopBar";

/** Timeline's minimal bar: identity left, back to the thread + settings right. */
export function TimelineTopBar() {
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
          <Link href="/thread" aria-label="thread" className="tap flex items-center justify-center rounded-full text-fg-soft hover:bg-surface-2">
            <Icon icon={MessageCircle} size={20} />
          </Link>
          <Link href="/settings" aria-label="settings" className="tap flex items-center justify-center rounded-full text-fg-soft hover:bg-surface-2">
            <Icon icon={Settings} size={20} />
          </Link>
        </>
      }
    />
  );
}
