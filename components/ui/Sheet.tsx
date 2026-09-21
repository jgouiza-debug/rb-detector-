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
        "m-0 h-auto max-h-[90dvh] w-full max-w-none overflow-auto rounded-t-sheet bg-surface p-0 text-fg shadow-3 backdrop:bg-ink/40 open:animate-fade-up",
        "fixed inset-x-0 bottom-0 top-auto sm:inset-0 sm:m-auto sm:max-w-md sm:rounded-sheet",
        className,
      )}
    >
      {/* The close button is positioned, not first in flow, on purpose:
          showModal()'s autofocus lands on the first focusable descendant, and
          when the X came first it stole focus from the email field, the
          delete-confirm input and the voice action. Rendering it last (still
          top-right) lets focus fall on the sheet's real first control. */}
      <div className="pb-safe relative p-6">
        {title && <h2 className="mb-4 pr-8 font-display text-lg">{title}</h2>}
        {children}
        {dismissible && (
          <button
            type="button"
            onClick={onClose}
            className="tap absolute right-3 top-3 flex items-center justify-center rounded-pill text-fg-soft transition-colors duration-150 hover:bg-surface-2 active:bg-line/40"
            aria-label="close"
          >
            <Icon icon={X} size={20} />
          </button>
        )}
      </div>
    </dialog>
  );
}
