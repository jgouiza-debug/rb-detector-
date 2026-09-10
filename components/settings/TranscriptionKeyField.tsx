"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

/**
 * Write-only manager for the user's own transcription key. It only ever learns
 * whether a key is set (never the value), so the secret stays server-side.
 */
export function TranscriptionKeyField() {
  const { toast } = useToast();
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/settings/transcription")
      .then((r) => (r.ok ? r.json() : { configured: false }))
      .then((d: { configured?: boolean }) => setConfigured(!!d.configured))
      .catch(() => setConfigured(false));
  }, []);

  async function save() {
    const key = value.trim();
    if (key.length < 8) {
      toast("that key looks too short");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/settings/transcription", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }) });
      if (!res.ok) throw new Error();
      setConfigured(true);
      setValue("");
      toast("key saved");
    } catch {
      toast("couldn't save that key");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    try {
      const res = await fetch("/api/settings/transcription", { method: "DELETE" });
      if (!res.ok) throw new Error();
      setConfigured(false);
      toast("key removed");
    } catch {
      toast("couldn't remove that key");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-card bg-surface p-4 ring-1 ring-line">
      {configured ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-fg">
            <span className="font-semibold">a key is set.</span> voice notes can transcribe through your provider.
          </p>
          <Button variant="soft" size="sm" onClick={remove} disabled={busy}>
            remove
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="paste your API key"
            aria-label="transcription API key"
            autoComplete="off"
            className="w-full rounded-field border border-line bg-bg px-4 py-3 text-[15px] text-fg outline-none focus-visible:outline-3 focus-visible:outline-ring"
          />
          <Button variant="strong" size="md" onClick={save} disabled={busy || value.trim().length < 8}>
            {busy ? "saving…" : "save key"}
          </Button>
        </div>
      )}
    </div>
  );
}
