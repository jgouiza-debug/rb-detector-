/** Build a streaming NDJSON Response from an async generator of JSON-serializable events. */
export function ndjsonStream<T>(gen: AsyncIterable<T>): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const ev of gen) controller.enqueue(encoder.encode(JSON.stringify(ev) + "\n"));
      } catch (e) {
        controller.enqueue(encoder.encode(JSON.stringify({ type: "error", code: "stream_error", message: e instanceof Error ? e.message : "error" }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
