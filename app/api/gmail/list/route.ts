import { NextResponse } from "next/server";
import { getAuthedClient } from "@/lib/auth";
import { listMessages } from "@/lib/gmail";

export async function GET(req: Request) {
  const auth = await getAuthedClient();

  if (!auth) {
    return NextResponse.json({ error: "Not connected to Gmail" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";
  const maxResults = Number(searchParams.get("maxResults") ?? 25);

  try {
    const emails = await listMessages(auth, { query, maxResults });
    return NextResponse.json(emails);
  } catch (err: any) {
    console.error("Gmail list error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to fetch emails" }, { status: 500 });
  }
}