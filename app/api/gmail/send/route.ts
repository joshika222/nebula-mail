import { NextResponse } from "next/server";
import { getAuthedClient } from "@/lib/auth";
import { sendMessage } from "@/lib/gmail";

export async function POST(req: Request) {
  const auth = await getAuthedClient();
  if (!auth) {
    return NextResponse.json({ error: "Not connected to Gmail" }, { status: 401 });
  }

  const { to, subject, body, threadId } = await req.json();

  if (!to || !subject || !body) {
    return NextResponse.json({ error: "Missing to, subject, or body" }, { status: 400 });
  }

  try {
    await sendMessage(auth, { to, subject, body, threadId });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Gmail send error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to send email" }, { status: 500 });
  }
}