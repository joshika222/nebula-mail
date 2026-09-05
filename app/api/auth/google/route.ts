import { NextResponse } from "next/server";
import { getOAuthClient, SCOPES } from "@/lib/auth";

export async function GET() {
  const oauth2Client = getOAuthClient();

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline", // needed to receive a refresh_token
    prompt: "consent",      // forces refresh_token on every connect, useful while testing
    scope: SCOPES,
  });

  return NextResponse.redirect(url);
}
