import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function SettingRow({ href, icon, title, subtitle, right }: { href?: string; icon?: LucideIcon; title: string; subtitle?: string; right?: ReactNode }) {
  const inner = (
    <>
      <div className="flex items-center gap-4">
        {icon && <span className="grid size-9 place-items-center rounded-full bg-surface-2 text-fg"><Icon icon={icon} size={18} /></span>}
        <span>
          <span className="block font-semibold text-fg">{title}</span>
          {subtitle && <span className="block text-sm text-fg-soft">{subtitle}</span>}
        </span>
      </div>
      {right ?? (href ? <Icon icon={ChevronRight} size={18} /> : null)}
    </>
  );
  const base = "tap flex w-full items-center justify-between gap-2 rounded-field bg-surface px-4 py-2 min-h-14 text-left";
  const cls = href ? `${base} transition-colors duration-150 hover:bg-surface-2 active:bg-line/40` : base;
  return href ? <Link href={href} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}
