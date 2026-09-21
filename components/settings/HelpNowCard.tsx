import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export function HelpNowCard() {
  return (
    <Link href="/help" className="tap flex items-center gap-4 rounded-card bg-blush/25 p-4 dark:bg-surface dark:ring-1 dark:ring-blush/30">
      <span className="grid size-10 place-items-center rounded-pill bg-blush/50 text-blush-ink dark:bg-blush/15 dark:text-blush"><Icon icon={HeartHandshake} size={20} /></span>
      <span>
        <span className="block font-semibold text-fg">get help now</span>
        <span className="block text-sm text-fg-soft">real people, any time — if things feel heavy</span>
      </span>
    </Link>
  );
}
