import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export function HelpNowCard() {
  return (
    <Link href="/help" className="flex items-center gap-3 rounded-card bg-blush/25 px-4 py-3">
      <span className="grid size-10 place-items-center rounded-full bg-blush/50 text-blush-ink"><Icon icon={HeartHandshake} size={20} /></span>
      <span>
        <span className="block font-semibold text-fg">get help now</span>
        <span className="block text-sm text-fg-soft">real people, any time — if things feel heavy</span>
      </span>
    </Link>
  );
}
