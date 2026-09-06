import type { Db } from "@/lib/db/client";
import { setPortsForTests, type Ports } from "@/lib/ports";
import { scriptedAi } from "@/lib/adapters/ai/scripted";
import type { AiPort } from "@/lib/ports/ai";

/**
 * Install test ports that route DB work at a provided pglite `db` and let a test
 * override the AI. getDb() is stubbed via a module-scoped override so the app
 * code under test talks to the same in-memory database.
 */
export function installTestPorts(opts: { db: Db; ai?: AiPort; now?: () => Date; blobStore?: Map<string, Uint8Array> }): void {
  const store = opts.blobStore ?? new Map<string, Uint8Array>();
  const ports: Ports = {
    clock: { now: opts.now ?? (() => new Date("2026-10-26T15:00:00Z")) },
    auth: {
      async getSession() {
        return null;
      },
      async signInAnonymously() {
        throw new Error("not used");
      },
      async startEmailLink() {},
      async verifyEmailLink() {
        throw new Error("not used");
      },
      async startEmailSignIn() {},
      async verifyEmailSignIn() {
        throw new Error("not used");
      },
      async attachEmail() {
        return "attached";
      },
      async signOut() {},
      async deleteAuthUser() {},
    },
    blob: {
      async put(key, bytes) {
        store.set(key, bytes);
      },
      async get(key) {
        return store.get(key) ?? null;
      },
      async deletePrefix(prefix) {
        for (const k of store.keys()) if (k.startsWith(prefix)) store.delete(k);
      },
    },
    ai: opts.ai ?? scriptedAi(),
    billing: {} as never,
    push: { async send() { return "ok"; }, publicKey: () => "test" },
  };
  setPortsForTests(ports);
}
