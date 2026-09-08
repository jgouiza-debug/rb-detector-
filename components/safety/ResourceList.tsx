import { ExternalLink, MessageSquare, Phone } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import type { CrisisResource } from "@/lib/safety/resources";

/**
 * The one way a crisis resource is drawn. The thread card and the help page were
 * rendering the same five resources as two different components with different
 * heights, grounds and row counts; someone in trouble should meet the same object
 * wherever they find it.
 */
export function ResourceRows({ resources, ground = "surface-2" }: { resources: CrisisResource[]; ground?: "surface" | "surface-2" }) {
  return (
    <ul className={`flex flex-col divide-y divide-line rounded-card ${ground === "surface" ? "bg-surface" : "bg-surface-2"}`}>
      {resources.map((r) => {
        const href = r.tel ? `tel:${r.tel}` : r.sms ? `sms:${r.sms}` : r.href;
        const external = !r.tel && !r.sms && !!r.href;
        return (
          <li key={`${r.region}-${r.name}`}>
            <a
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="tap flex items-center gap-4 px-4 py-2 text-fg transition-colors duration-150 active:bg-line/40"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold uppercase tracking-wide text-fg-soft">{r.region}</span>
                <span className="block text-sm font-semibold">
                  {r.name} <span className="font-normal text-fg-soft">· {r.detail}</span>
                </span>
              </span>
              <Icon icon={r.tel ? Phone : r.sms ? MessageSquare : ExternalLink} size={18} className="shrink-0 text-fg-soft" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/** The 988 pair, sized for a thumb. Same anatomy in the thread and on the help page. */
export function PrimaryResource({ resource, ground = "surface-2" }: { resource: CrisisResource; ground?: "surface" | "surface-2" }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-fg-soft">{resource.region} · {resource.name}</div>
      <div className="flex gap-2">
        {resource.tel && (
          <a href={`tel:${resource.tel}`} className="tap crisis-primary inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-pill bg-cta text-lg font-semibold text-cta-fg transition-transform duration-150 active:scale-[0.98]">
            <Icon icon={Phone} size={20} /> call {resource.tel}
          </a>
        )}
        {resource.sms && (
          <a href={`sms:${resource.sms}`} className={`tap inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-pill ${ground === "surface" ? "bg-surface" : "bg-surface-2"} text-lg font-semibold text-fg ring-1 ring-line transition-transform duration-150 active:scale-[0.98]`}>
            <Icon icon={MessageSquare} size={20} /> text {resource.sms}
          </a>
        )}
      </div>
    </div>
  );
}
