"use client";
import { useEffect } from "react";

/**
 * Registers /sw.js?v=BUILD_ID only when NEXT_PUBLIC_SW=1 (set in the deployed
 * cloud environment). Kept off in dev and e2e so tests are deterministic; the
 * service worker's runtime behavior (offline, push, install) is validated in
 * production via a Lighthouse PWA audit.
 */
export function RegisterSW() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SW !== "1") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const v = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
    navigator.serviceWorker.register(`/sw.js?v=${v}`, { scope: "/" }).catch(() => {});
  }, []);
  return null;
}
