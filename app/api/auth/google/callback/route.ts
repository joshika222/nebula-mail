import { NextResponse } from "next/server";
import { getOAuthClient } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, origin));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", origin));
  }

  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  const res = NextResponse.redirect(new URL("/", origin));

  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  if (tokens.access_token) {
    res.cookies.set("gmail_access_token", tokens.access_token, cookieOpts);
  }
  // refresh_token is only sent the first time (or when prompt=consent), so
  // don't overwrite an existing one with an empty value on later logins.
  if (tokens.refresh_token) {
    res.cookies.set("gmail_refresh_token", tokens.refresh_token, cookieOpts);
  }
  if (tokens.expiry_date) {
    res.cookies.set("gmail_token_expiry", String(tokens.expiry_date), cookieOpts);
  }

  return res;
}
