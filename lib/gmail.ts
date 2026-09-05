import { google } from "googleapis";


export interface Email {
  id: string;
  threadId: string;
  from: string;
  to?: string;
  subject: string;
  snippet: string;
  body?: string;
  date: string;
  unread: boolean;
}

/**
 * Fetches a list of message IDs matching a Gmail search query, then loads
 * lightweight metadata for each (fast — no full body).
 */
export async function listMessages(
  auth: any,
  { query = "", maxResults = 25 }: { query?: string; maxResults?: number } = {}
): Promise<Email[]> {
  const gmail = google.gmail({ version: "v1", auth });

  const { data } = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  const refs = data.messages ?? [];
  if (refs.length === 0) return [];

  const emails = await Promise.all(
    refs.map((m) => getMessageMetadata(gmail, m.id as string))
  );

  return emails;
}

async function getMessageMetadata(
  gmail: ReturnType<typeof google.gmail>,
  id: string
): Promise<Email> {
  const { data } = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "metadata",
    metadataHeaders: ["From", "To", "Subject", "Date"],
  });

  return parseMessage(data);
}

/**
 * Fetches the full message (headers + body) for a single email — used
 * when the user opens the detail view.
 */
export async function getMessage(auth: any, id: string): Promise<Email> {
  const gmail = google.gmail({ version: "v1", auth });
  const { data } = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  });
  return parseMessage(data, true);
}

function getHeader(headers: { name?: string | null; value?: string | null }[] | undefined, name: string) {
  return headers?.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value ?? "";
}

function decodeBase64Url(data: string) {
  return Buffer.from(data, "base64url").toString("utf-8");
}

function extractBody(payload: any): string {
  if (!payload) return "";

  if (payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  if (payload.parts) {
    const plainPart = payload.parts.find((p: any) => p.mimeType === "text/plain");
    if (plainPart?.body?.data) return decodeBase64Url(plainPart.body.data);

    for (const part of payload.parts) {
      const nested = extractBody(part);
      if (nested) return nested;
    }
  }

  return "";
}

function parseMessage(data: any, includeBody = false): Email {
  const headers = data.payload?.headers;
  const isUnread = (data.labelIds ?? []).includes("UNREAD");

  return {
    id: data.id,
    threadId: data.threadId,
    from: getHeader(headers, "From"),
    to: getHeader(headers, "To"),
    subject: getHeader(headers, "Subject") || "(no subject)",
    snippet: data.snippet ?? "",
    body: includeBody ? extractBody(data.payload) : undefined,
    date: getHeader(headers, "Date"),
    unread: isUnread,
  };
}

/**
 * Builds a base64url-encoded raw MIME message that the Gmail API's
 * messages.send endpoint expects.
 */
function buildRawEmail({ to, subject, body }: { to: string; subject: string; body: string }) {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    body,
  ].join("\r\n");

  return Buffer.from(message).toString("base64url");
}

export async function sendMessage(
  auth: any,
  { to, subject, body, threadId }: { to: string; subject: string; body: string; threadId?: string }
) {
  const gmail = google.gmail({ version: "v1", auth });
  const raw = buildRawEmail({ to, subject, body });

  return gmail.users.messages.send({
    userId: "me",
    requestBody: { raw, threadId },
  });
}