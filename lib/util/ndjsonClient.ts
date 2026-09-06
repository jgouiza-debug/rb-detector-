"use client";

/** Read an NDJSON fetch response line by line, yielding parsed objects. */
export async function* readNdjson<T>(res: Response): AsyncGenerator<T> {
  const reader = res.body?.getReader();
  if (!reader) return;
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) yield JSON.parse(line) as T;
    }
  }
  const tail = buf.trim();
  if (tail) yield JSON.parse(tail) as T;
}
