"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { PipMascot } from "@/components/pip/PipMascot";
import { Button } from "@/components/ui/Button";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendCode() {
    setBusy(true);
    setErr(null);
    await fetch("/api/auth/signin/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStage("code");
    setBusy(false);
  }
  async function verify() {
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/auth/signin/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    if (res.ok) router.push("/thread");
    else {
      setErr("that code didn't work. try again?");
      setBusy(false);
    }
  }

  return (
    <main
      id="main"
      className="pt-safe mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <PipMascot expression="listening" size={110} />
      <h1 className="font-display text-3xl">welcome back</h1>
      {stage === "email" ? (
        <>
          <p className="text-fg-soft">
            enter your email and i&apos;ll send a code.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            aria-label="email"
            className="w-full rounded-field border border-line bg-surface px-4 py-4 text-center text-lg outline-none focus-visible:outline-3 focus-visible:outline-ring"
          />
          <Button
            full
            size="lg"
            onClick={sendCode}
            disabled={busy || !email.includes("@")}
          >
            send me a code
          </Button>
        </>
      ) : (
        <>
          <p className="text-fg-soft">
            enter the 6-digit code sent to {email}.
          </p>
          <input
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            aria-label="code"
            className="w-full rounded-field border border-line bg-surface px-4 py-4 text-center text-2xl tracking-[0.4em] outline-none focus-visible:outline-3 focus-visible:outline-ring"
          />
          {/* An error nobody is told about is an error nobody can act on. */}
          <p role="alert" className="text-sm text-blush-ink">
            {err}
          </p>
          <Button
            full
            size="lg"
            onClick={verify}
            disabled={busy || code.length < 4}
          >
            sign in
          </Button>
        </>
      )}
      <Link
        href="/welcome"
        className="tap inline-flex items-center justify-center rounded-pill px-4 text-sm font-semibold text-fg-soft underline underline-offset-4"
      >
        new here? start fresh
      </Link>
    </main>
  );
}
