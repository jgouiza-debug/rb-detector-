/**
 * Client-side downscale before upload: decode, cap the long edge, re-encode as
 * JPEG. Runs in the browser only. HEIC that the browser can't decode throws and
 * the caller shows a friendly message.
 */
export async function downscaleImage(file: File, maxEdge = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("unsupported image format");
  });
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", quality);
  });
}
