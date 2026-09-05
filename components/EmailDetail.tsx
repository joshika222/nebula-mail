"use client";

import { useEffect, useState } from "react";
import { useUIStore, Email } from "@/store/uiStore";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

export default function EmailDetail() {
  const { openEmailId, setView, setComposeDraft } = useUIStore();
  const [email, setEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!openEmailId) return;
    setLoading(true);
    fetch(`/api/gmail/${openEmailId}`)
      .then((res) => res.json())
      .then((data) => setEmail(data))
      .finally(() => setLoading(false));
  }, [openEmailId]);

  useCopilotReadable({
    description: "The email currently open in the detail view, if any",
    value: email
      ? { id: email.id, from: email.from, subject: email.subject, snippet: email.snippet, body: email.body }
      : null,
  });

  useCopilotAction({
    name: "reply_to_email",
    description: "Open a reply to an email, pre-filled with To and Subject. If no emailId is given, reply to the currently open email.",
    parameters: [
      { name: "emailId", type: "string", required: false, description: "Id of the email to reply to; defaults to the currently open one" },
      { name: "body", type: "string", required: false, description: "Drafted reply body text" },
    ],
    handler: async ({ body }) => {
      if (!email) return "No email is currently open to reply to.";
      const fromMatch = email.from.match(/<(.+)>/);
      const replyTo = fromMatch ? fromMatch[1] : email.from;
      const subject = email.subject.startsWith("Re:") ? email.subject : `Re: ${email.subject}`;
      setView("compose");
      setComposeDraft({ to: replyTo, subject, body: body ?? "", threadId: email.threadId });
      return "Reply drafted and compose view opened.";
    },
  });

  if (loading) return <p className="px-1 py-6 text-sm text-[var(--ink)]/50">Loading email…</p>;
  if (!email) return <p className="px-1 py-6 text-sm text-[var(--ink)]/50">Email not found.</p>;

  return (
    <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--line)" }}>
      <button
        onClick={() => setView("inbox")}
        className="mb-5 text-sm font-medium"
        style={{ color: "var(--accent)" }}
      >
        ← Back to Inbox
      </button>

      <h2 className="text-xl font-medium tracking-tight">{email.subject}</h2>

      <div className="mt-3 space-y-1 text-sm text-[var(--ink)]/60">
        <div><span className="text-[var(--ink)]/40">From </span>{email.from}</div>
        <div><span className="text-[var(--ink)]/40">To </span>{email.to}</div>
        <div><span className="text-[var(--ink)]/40">Date </span>{new Date(email.date).toLocaleString()}</div>
      </div>

      <div
        className="mt-5 whitespace-pre-wrap border-t pt-5 text-[15px] leading-relaxed"
        style={{ borderColor: "var(--line)" }}
      >
        {email.body || email.snippet}
      </div>
    </div>
  );
}