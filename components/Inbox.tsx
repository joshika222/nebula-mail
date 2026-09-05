"use client";

import { useEffect, useState, useCallback } from "react";
import { useUIStore, Email, buildGmailQuery } from "@/store/uiStore";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import FilterBar from "@/components/FilterBar";

function initials(from: string) {
  const name = from.replace(/<.*>/, "").trim();
  const parts = name.split(" ").filter(Boolean);
  const chars = parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
  return chars.toUpperCase();
}

function avatarColor(seed: string) {
  const palette = ["#2d5c4d", "#6b4c93", "#b1552f", "#2f5a8f", "#8a6d1f"];
  let hash = 0;
  for (const ch of seed) hash = (hash + ch.charCodeAt(0)) % palette.length;
  return palette[hash];
}

export default function Inbox() {
  const { emails, setEmails, setOpenEmailId, setView, filters, setFilters } = useUIStore();
  const [loading, setLoading] = useState(true);

  const fetchInbox = useCallback(async () => {
    setLoading(true);
    const query = buildGmailQuery(filters, "inbox");
    const res = await fetch(`/api/gmail/list?q=${encodeURIComponent(query)}&maxResults=20`);
    const data = await res.json();
    if (Array.isArray(data)) setEmails(data);
    setLoading(false);

  }, [filters, setEmails]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  useEffect(() => {
    const source = new EventSource("/api/stream");
    source.onmessage = () => fetchInbox();
    return () => source.close();
  }, [fetchInbox]);

  useCopilotReadable({
    description: "The list of emails currently shown in the inbox",
    value: emails.map((e) => ({ id: e.id, from: e.from, subject: e.subject, date: e.date, unread: e.unread })),
  });

  useCopilotAction({
    name: "search_emails",
    description: "Search and filter emails in the inbox by sender, keyword, date range, or unread status. Updates the visible inbox list.",
    parameters: [
      { name: "sender", type: "string", required: false, description: "Filter by sender email or name" },
      { name: "keyword", type: "string", required: false, description: "Filter by keyword in subject/body" },
      { name: "days", type: "number", required: false, description: "Only show emails from the last N days" },
      { name: "unreadOnly", type: "boolean", required: false, description: "Only show unread emails" },
    ],
    handler: async ({ sender, keyword, days, unreadOnly }) => {
      setView("inbox");
      const dateFrom = days
        ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : undefined;
      setFilters({ sender: sender ?? "", keyword: keyword ?? "", dateFrom: dateFrom ?? "", unreadOnly: unreadOnly ?? false });

      return "Inbox filtered and updated.";
    },
  });

  useCopilotAction({
    name: "open_email",
    description: "Open a specific email in the detail view, given its id from the inbox list",
    parameters: [{ name: "emailId", type: "string", required: true, description: "The id of the email to open" }],
    handler: async ({ emailId }) => {
      setOpenEmailId(emailId);
      setView("detail");
      return "Email opened.";
    },
  });

  function openEmail(email: Email) {
    setOpenEmailId(email.id);
    setView("detail");
  }

  return (
    <div>
      <FilterBar />

      {loading && <p className="px-1 py-6 text-sm text-[var(--ink)]/50">Loading inbox…</p>}
      {!loading && emails.length === 0 && (
        <p className="px-1 py-6 text-sm text-[var(--ink)]/50">No emails match these filters.</p>
      )}

      <ul className="mt-3 space-y-1.5">
        {emails.map((email) => (
          <li

            key={email.id}
            onClick={() => openEmail(email)}
            className="flex cursor-pointer items-start gap-3 rounded-xl border bg-white px-4 py-3 transition-colors hover:border-[var(--accent)]/40"
            style={{ borderColor: "var(--line)" }}
          >
            <div
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: avatarColor(email.from) }}
            >
              {initials(email.from)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className={`truncate text-sm ${email.unread ? "font-semibold" : "font-medium text-[var(--ink)]/70"}`}>
                  {email.from.replace(/<.*>/, "").trim()}
                </span>
                <span className="shrink-0 text-xs text-[var(--ink)]/40">
                  {new Date(email.date).toLocaleDateString()}
                </span>
              </div>
              <div className={`truncate text-sm ${email.unread ? "font-medium" : "text-[var(--ink)]/70"}`}>
                {email.subject}
              </div>
              <div className="truncate text-xs text-[var(--ink)]/45">{email.snippet}</div>
            </div>

            {email.unread && (
              <span
                className="mt-2 h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: "var(--accent)" }}
              />

            )}
          </li>
        ))}
      </ul>
    </div>
  );
}