"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";

export function DangerZone() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  async function doDelete() {
    setBusy(true);
    const res = await fetch("/api/settings/delete", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ confirm: "delete" }),
    });
    if (res.ok) {
      try {
        const regs = await navigator.serviceWorker?.getRegistrations?.();
        await Promise.all((regs ?? []).map((r) => r.unregister()));
        const keys = await caches?.keys?.();
        await Promise.all((keys ?? []).map((k) => caches.delete(k)));
      } catch {
        /* ignore */
      }
      router.push("/goodbye");
    } else setBusy(false);
  }

  return (
    <>
      <Button
        variant="ghost"
        full
        className="text-blush-ink"
        onClick={() => setOpen(true)}
      >
        delete my account
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="delete everything?"
      >
        <p className="mb-4 text-fg-soft">
          this permanently deletes your account, every message and memory, and
          all your photos. it can&apos;t be undone. you can export your story
          first from the data screen.
        </p>
        <label className="mb-2 block text-sm font-semibold">
          type{" "}
          <span className="rounded-field bg-surface-2 px-2 font-semibold tracking-wide text-fg">
            delete
          </span>{" "}
          to confirm
        </label>
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-label="type delete to confirm"
          className="mb-4 w-full rounded-field border border-line bg-surface px-4 py-2 min-h-12 outline-none focus-visible:outline-3 focus-visible:outline-ring"
        />
        <Button
          variant="danger"
          full
          disabled={confirm !== "delete" || busy}
          onClick={doDelete}
        >
          {busy ? "deleting…" : "delete forever"}
        </Button>
      </Sheet>
    </>
  );
}
