"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { subscribeToPush } from "@/components/pwa/usePush";

export function NotifyControls() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function enable() {
    setBusy(true);
    const result = await subscribeToPush();
    toast(result === "subscribed" ? "notifications on 🌱" : result === "denied" ? "notifications are blocked in your browser" : "notifications aren't supported here");
    setBusy(false);
  }
  async function test() {
    setBusy(true);
    const res = await fetch("/api/push/test", { method: "POST" });
    const data = await res.json().catch(() => ({ sent: 0 }));
    toast(data.sent > 0 ? "sent a test 🌱" : "no device subscribed yet — turn notifications on first");
    setBusy(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button variant="soft" onClick={enable} disabled={busy}>turn on notifications</Button>
      <Button variant="ghost" onClick={test} disabled={busy}>send me a test</Button>
    </div>
  );
}
