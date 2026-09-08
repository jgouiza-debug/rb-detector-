import Link from "next/link";
import { Settings } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { PipAvatar } from "@/components/pip/PipAvatar";
import { TopBar } from "@/components/ui/TopBar";

/** Timeline's minimal bar: identity left, settings right. Cross-navigation is the
 *  bottom nav's job now, so the bar does not offer a second route to the thread. */
export function TimelineTopBar() {
  return (
    <TopBar
      left={
        <span className="flex items-center gap-2">
          <PipAvatar size={30} />
          <span className="font-display text-lg tracking-tight">pip</span>
        </span>
      }
      right={
        <Link href="/settings" aria-label="settings" className="tap flex items-center justify-center rounded-full text-fg-soft transition-colors duration-150 hover:bg-surface-2 active:bg-line/40">
          <Icon icon={Settings} size={20} />
        </Link>
      }
    />
  );
}
