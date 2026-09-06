import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getEnv } from "@/lib/env";
import type { BlobPort } from "@/lib/ports/blob";

// Local-only adapter. The turbopackIgnore hints stop Turbopack from tracing the
// whole project into the server bundle over these dynamic path constructions
// (the fs blob store is never used in cloud mode).
function root(): string {
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), getEnv().blob.dir);
}

function resolve(key: string): string {
  const base = root();
  const full = path.join(/* turbopackIgnore: true */ base, key);
  if (!full.startsWith(base + path.sep) && full !== base) throw new Error("blob key escapes root");
  return full;
}

export function fsBlob(): BlobPort {
  return {
    async put(key, bytes) {
      const p = resolve(key);
      await mkdir(path.dirname(p), { recursive: true });
      await writeFile(p, bytes);
    },
    async get(key) {
      try {
        return new Uint8Array(await readFile(resolve(key)));
      } catch {
        return null;
      }
    },
    async deletePrefix(prefix) {
      await rm(resolve(prefix), { recursive: true, force: true });
    },
  };
}
