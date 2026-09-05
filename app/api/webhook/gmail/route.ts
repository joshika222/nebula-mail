import { NextResponse } from "next/server";
import { getClients } from "@/lib/sse";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const decoded = JSON.parse(
      Buffer.from(body.message.data, "base64").toString("utf-8")
    );

    console.log("Gmail push notification received:", decoded);

    const clients = getClients();
    const message = `data: ${JSON.stringify(decoded)}\n\n`;

    for (const controller of clients) {
      try {
        controller.enqueue(message);
      } catch (err) {
        // This connection is dead (browser closed/reloaded) — remove it
        // instead of letting it break delivery to everyone else.
        clients.delete(controller);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ success: false });
  }
}