"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function AccountEditor({
  name,
  email,
  isAnonymous,
}: {
  name: string;
  email: string | null;
  isAnonymous: boolean;
}) {
  const { toast } = useToast();
  const [n, setN] = useState(name);
  const [linkEmail, setLinkEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"idle" | "code">("idle");
  const [busy, setBusy] = useState(false);

  async function saveName() {
    setBusy(true);
    await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: n.trim() || null }),
    });
    toast("saved");
    setBusy(false);
  }
  async function sendLink() {
    setBusy(true);
    await fetch("/api/auth/link/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: linkEmail }),
    });
    setStage("code");
    setBusy(false);
  }
  async function verify() {
    setBusy(true);
    const res = await fetch("/api/auth/link/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: linkEmail, code }),
    });
    if (res.ok) {
      toast("email saved", "warm");
      setTimeout(() => window.location.reload(), 700);
    } else {
      toast("that code didn't work");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label
          htmlFor="account-name"
          className="mb-1 block text-sm font-semibold"
        >
          your name
        </label>
        <div className="flex gap-2">
          <input
            id="account-name"
            value={n}
            onChange={(e) => setN(e.target.value)}
            className="min-w-0 flex-1 rounded-field border border-line bg-surface px-4 py-2 min-h-12 outline-none focus-visible:outline-3 focus-visible:outline-ring"
          />
          <Button
            className="shrink-0 whitespace-nowrap"
            variant="soft"
            onClick={saveName}
            disabled={busy}
          >
            save
          </Button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold">email</label>
        {email ? (
          <p className="rounded-field bg-surface px-4 py-2 min-h-14 text-fg-soft">
            {email}
          </p>
        ) : (
          <div className="rounded-card bg-surface p-4">
            <p className="mb-4 text-sm text-fg-soft">
              {isAnonymous
                ? "add an email so your story is safe if you switch phones or clear your browser."
                : "add an email to secure your account."}
            </p>
            {stage === "idle" ? (
              <div className="flex gap-2">
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="you@email.com"
                  aria-label="email"
                  className="min-w-0 flex-1 rounded-field border border-line bg-bg px-4 py-2 min-h-12 outline-none focus-visible:outline-3 focus-visible:outline-ring"
                />
                <Button
                  className="shrink-0 whitespace-nowrap"
                  onClick={sendLink}
                  disabled={busy || !linkEmail.includes("@")}
                >
                  send code
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="000000"
                  aria-label="code"
                  className="min-w-0 flex-1 rounded-field border border-line bg-bg px-4 py-2 min-h-12 text-center tracking-widest outline-none focus-visible:outline-3 focus-visible:outline-ring"
                />
                <Button
                  className="shrink-0 whitespace-nowrap"
                  onClick={verify}
                  disabled={busy || code.length < 4}
                >
                  confirm
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
