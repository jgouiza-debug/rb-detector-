"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function signOut() {
    // Every other action button in the app disables while its request is in
    // flight; this one was the exception and could be double-tapped.
    setBusy(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.push("/welcome");
    } catch {
      setBusy(false);
    }
  }
  return (
    <Button
      variant="soft"
      full
      disabled={busy}
      onClick={signOut}
      className="text-fg-soft"
    >
      <Icon icon={LogOut} size={18} /> {busy ? "signing out…" : "sign out"}
    </Button>
  );
}
