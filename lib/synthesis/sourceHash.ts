import { sha256 } from "@/lib/util/ids";

/** Deterministic hash of a day's inputs, so re-running synthesis is a no-op when
 * nothing changed and re-synthesizes (version++) when new entries land. */
export function computeSourceHash(input: { messageIds: string[]; mediaIds: string[]; careMode: boolean }): string {
  const ids = [...input.messageIds].sort().join(",");
  const media = [...input.mediaIds].sort().join(",");
  return sha256(`${ids}|${media}|care:${input.careMode ? 1 : 0}`);
}
