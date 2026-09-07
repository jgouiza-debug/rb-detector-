"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { Icon } from "./Icon";
import { cn } from "@/lib/util/cn";

/** Bottom sheet on mobile, centered card on desktop. Native <dialog> for focus + Escape. */
export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
  dismissible = true,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  dismissible?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onClose={onClose}
      onCancel={(e) => {
        if (!dismissible) e.preventDefault();
      }}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onClose();
      }}
      className={cn(
        "m-0 h-auto max-h-[90dvh] w-full max-w-none overflow-auto rounded-t-3xl bg-surface p-0 text-fg shadow-3 backdrop:bg-ink/40 open:animate-fade-up",
        "fixed inset-x-0 bottom-0 top-auto sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-3xl",
        className,
      )}
    >
      <div className="pb-safe p-6">
        <div className="mb-4 flex items-center justify-between">
          {title ? <h2 className="font-display text-lg">{title}</h2> : <span />}
          {dismissible && (
            <button type="button" onClick={onClose} className="tap -mr-2 flex items-center justify-center rounded-full text-fg-soft hover:bg-surface-2" aria-label="close">
              <Icon icon={X} size={20} />
            </button>
          )}
        </div>
        {children}
      </div>
    </dialog>
  );
}
