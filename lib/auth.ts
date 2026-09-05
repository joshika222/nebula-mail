import { google } from "googleapis";
import { cookies } from "next/headers";

export const SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
];

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

/**
 * Builds an authenticated OAuth2 client from the tokens stored in cookies.
 * Storing tokens in httpOnly cookies is fine for this project's scope;
 * a production app would persist them server-side keyed by user id.
 */
export async function getAuthedClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("gmail_access_token")?.value;
  const refreshToken = cookieStore.get("gmail_refresh_token")?.value;

  if (!accessToken && !refreshToken) return null;

  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oauth2Client;
}
