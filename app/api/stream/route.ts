import { getClients } from "@/lib/sse";

export async function GET() {
  const clients = getClients();

  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
    },
    cancel(controller) {
      clients.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}