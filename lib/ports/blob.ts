export interface BlobPort {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<Uint8Array | null>;
  /** Delete every object under `${userId}/`. Idempotent. */
  deletePrefix(prefix: string): Promise<void>;
}
