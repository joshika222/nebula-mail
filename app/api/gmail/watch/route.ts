import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getAuthedClient } from "@/lib/auth";

export async function POST() {
  const auth = await getAuthedClient();
  if (!auth) {
    return NextResponse.json({ error: "Not connected to Gmail" }, { status: 401 });
  }

  const gmail = google.gmail({ version: "v1", auth });

  try {
    const { data } = await gmail.users.watch({
      userId: "me",
      requestBody: {
        topicName: `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/topics/${process.env.GMAIL_PUBSUB_TOPIC}`,
        labelIds: ["INBOX"],
      },
    });

    console.log("Watch registered:", data);
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("Watch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}