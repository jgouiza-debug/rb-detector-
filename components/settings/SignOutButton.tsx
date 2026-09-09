"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/welcome");
  }
  // Uses the shared Button rather than a hand-rolled sixth button look, so it
  // sits in the same vocabulary as every other control.
  return (
    <Button variant="soft" full onClick={signOut} className="text-fg-soft">
      <Icon icon={LogOut} size={18} /> sign out
    </Button>
  );
}
