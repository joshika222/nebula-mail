import { NextResponse } from "next/server";
import { getAuthedClient } from "@/lib/auth";
import { getMessage } from "@/lib/gmail";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthedClient();
  if (!auth) {
    return NextResponse.json({ error: "Not connected to Gmail" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const email = await getMessage(auth, id);
    return NextResponse.json(email);
  } catch (err: any) {
    console.error("Gmail get error:", err);
    return NextResponse.json({ error: err.message ?? "Failed to fetch email" }, { status: 500 });
  }
}