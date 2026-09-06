import { afterEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { setPortsForTests } from "@/lib/ports";
import type { Ports } from "@/lib/ports";

const UID = "33333333-3333-3333-3333-333333333333";

afterEach(() => {
  vi.restoreAllMocks();
  setPortsForTests(null);
});

async function makeExifJpeg(): Promise<Uint8Array> {
  const buf = await sharp({ create: { width: 24, height: 24, channels: 3, background: { r: 200, g: 120, b: 40 } } })
    .withExif({ IFD0: { Copyright: "pip-secret-location", Make: "pip-cam" } })
    .jpeg()
    .toBuffer();
  return new Uint8Array(buf);
}

function installBlob(store: Map<string, Uint8Array>) {
  const ports = {
    clock: { now: () => new Date() },
    blob: {
      async put(key: string, bytes: Uint8Array) {
        store.set(key, bytes);
      },
      async get(key: string) {
        return store.get(key) ?? null;
      },
      async deletePrefix() {},
    },
  } as unknown as Ports;
  setPortsForTests(ports);
}

describe("media processing", () => {
  it("re-encodes and strips EXIF/GPS from stored bytes", async () => {
    process.env.APP_MODE = "local";
    const store = new Map<string, Uint8Array>();
    installBlob(store);
    const { processImage } = await import("@/lib/media/process");
    const input = await makeExifJpeg();
    expect(Buffer.from(input).includes(Buffer.from("pip-secret-location"))).toBe(true);

    const out = await processImage(UID, input);
    expect(out.keyFull).toBe(`${UID}/${out.mediaId}/full.jpg`);
    const full = store.get(out.keyFull)!;
    const thumb = store.get(out.keyThumb)!;
    expect(Buffer.from(full).includes(Buffer.from("Exif"))).toBe(false);
    expect(Buffer.from(full).includes(Buffer.from("pip-secret-location"))).toBe(false);
    expect(Buffer.from(thumb).includes(Buffer.from("pip-secret-location"))).toBe(false);
  });

  it("rejects non-image bytes with a friendly error", async () => {
    process.env.APP_MODE = "local";
    installBlob(new Map());
    const { processImage, ImageRejectedError } = await import("@/lib/media/process");
    await expect(processImage(UID, new Uint8Array([1, 2, 3, 4, 5]))).rejects.toBeInstanceOf(ImageRejectedError);
  });
});
