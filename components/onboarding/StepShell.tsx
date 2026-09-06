import type { ReactNode } from "react";

export function StepShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <main id="main" className="mx-auto flex min-h-[100dvh] max-w-md flex-col px-6 py-8">
      <div className="flex flex-1 flex-col justify-center gap-6">{children}</div>
      {footer && <div className="flex flex-col gap-3 pt-6">{footer}</div>}
    </main>
  );
}
