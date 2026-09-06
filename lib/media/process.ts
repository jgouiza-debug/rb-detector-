import "server-only";
import { getPorts } from "@/lib/ports";
import { newId } from "@/lib/util/ids";

export interface ProcessedMedia {
  mediaId: string;
  keyFull: string;
  keyThumb: string;
  width: number;
  height: number;
  bytes: number;
}

const MAGIC: { type: string; test: (b: Uint8Array) => boolean }[] = [
  { type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { type: "image/png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { type: "image/webp", test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 },
];

export function sniffImageType(bytes: Uint8Array): string | null {
  return MAGIC.find((m) => m.test(bytes))?.type ?? null;
}

/**
 * Re-encode with sharp: honor EXIF rotation, then STRIP all metadata (EXIF/GPS/ICC).
 * Produces a full (<=1600px) and a thumb (<=480px) JPEG, stores both via BlobPort.
 * Rejects anything that isn't a real JPEG/PNG/WebP.
 */
export async function processImage(userId: string, input: Uint8Array): Promise<ProcessedMedia> {
  if (!sniffImageType(input)) throw new ImageRejectedError("that file didn't look like a photo. try a JPG, PNG, or screenshot.");
  const sharp = (await import("sharp")).default;
  const mediaId = newId();
  const base = sharp(input, { failOn: "error" }).rotate(); // rotate() applies EXIF orientation
  const meta = await base.metadata();
  const fullBuf = await sharp(input).rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
  const thumbBuf = await sharp(input).rotate().resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer();
  const full = await sharp(fullBuf).metadata();
  const keyFull = `${userId}/${mediaId}/full.jpg`;
  const keyThumb = `${userId}/${mediaId}/thumb.jpg`;
  const blob = getPorts().blob;
  await blob.put(keyFull, new Uint8Array(fullBuf), "image/jpeg");
  await blob.put(keyThumb, new Uint8Array(thumbBuf), "image/jpeg");
  return { mediaId, keyFull, keyThumb, width: full.width ?? meta.width ?? 0, height: full.height ?? meta.height ?? 0, bytes: fullBuf.length };
}

export class ImageRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageRejectedError";
  }
}
