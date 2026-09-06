import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SettingRow({ href, icon, title, subtitle, right }: { href?: string; icon?: LucideIcon; title: string; subtitle?: string; right?: ReactNode }) {
  const inner = (
    <>
      <div className="flex items-center gap-3">
        {icon && <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-fg"><Icon icon={icon} size={18} /></span>}
        <span>
          <span className="block font-semibold text-fg">{title}</span>
          {subtitle && <span className="block text-sm text-fg-soft">{subtitle}</span>}
        </span>
      </div>
      {right ?? (href ? <Icon icon={ChevronRight} size={18} /> : null)}
    </>
  );
  const cls = "tap flex w-full items-center justify-between gap-2 rounded-2xl bg-surface px-4 py-3 text-left";
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}
