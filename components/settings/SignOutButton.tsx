"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Icon } from "@/components/ui/Icon";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/welcome");
  }
  return (
    <button onClick={signOut} className="tap flex w-full items-center justify-center gap-2 rounded-2xl bg-surface px-4 py-3 font-semibold text-fg-soft">
      <Icon icon={LogOut} size={18} /> sign out
    </button>
  );
}
