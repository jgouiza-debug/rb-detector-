import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getEnv } from "@/lib/env";
import type { BlobPort } from "@/lib/ports/blob";

let client: SupabaseClient | null = null;
function service(): SupabaseClient {
  if (client) return client;
  const env = getEnv();
  client = createClient(env.auth.supabaseUrl as string, env.auth.supabaseServiceRoleKey as string, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export function supabaseBlob(): BlobPort {
  const bucket = getEnv().blob.bucket;
  return {
    async put(key, bytes, contentType) {
      const { error } = await service().storage.from(bucket).upload(key, bytes, { contentType, upsert: true });
      if (error) throw new Error(`blob put failed: ${error.message}`);
    },
    async get(key) {
      const { data, error } = await service().storage.from(bucket).download(key);
      if (error || !data) return null;
      return new Uint8Array(await data.arrayBuffer());
    },
    async deletePrefix(prefix) {
      const store = service().storage.from(bucket);
      const clean = prefix.replace(/\/$/, "");
      // Two levels deep: {userId}/{mediaId}/{full|thumb}.jpg. A single list() caps
      // at 1000 rows, so page through the media folders — otherwise a user with
      // more than 1000 photos would keep orphaned blobs after account deletion.
      const toRemove: string[] = [];
      for (let offset = 0; ; offset += 1000) {
        const { data: dirs } = await store.list(clean, { limit: 1000, offset });
        if (!dirs || dirs.length === 0) break;
        for (const d of dirs) {
          const sub = `${clean}/${d.name}`;
          const { data: files } = await store.list(sub, { limit: 1000 });
          for (const f of files ?? []) toRemove.push(`${sub}/${f.name}`);
          if ((files ?? []).length === 0 && d.name) toRemove.push(sub);
        }
        if (dirs.length < 1000) break;
      }
      for (let i = 0; i < toRemove.length; i += 100) await store.remove(toRemove.slice(i, i + 100));
    },
  };
}
