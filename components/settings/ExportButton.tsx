"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function ExportButton() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  async function exportZip() {
    setBusy(true);
    try {
      const res = await fetch("/api/settings/export", { method: "POST" });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pip-export-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast("export failed, try again");
    } finally {
      setBusy(false);
    }
  }
  return <Button className="mt-4" onClick={exportZip} disabled={busy} data-testid="export-zip">{busy ? "gathering…" : "export my story"}</Button>;
}
