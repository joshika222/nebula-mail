"use client";

import { useState } from "react";
import { useUIStore } from "@/store/uiStore";

export default function Compose() {
  const { composeDraft, setComposeDraft, setView } = useUIStore();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeDraft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
      setComposeDraft({ to: "", subject: "", body: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  const inputClass =

    "w-full rounded-xl border bg-white px-4 py-2.5 text-sm placeholder:text-[var(--ink)]/35 focus:outline-none focus:ring-1";

  if (sent) {
    return (
      <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--line)" }}>
        <p className="font-medium" style={{ color: "var(--accent)" }}>Email sent</p>
        <button
          onClick={() => {
            setSent(false);
            setView("inbox");
          }}
          className="mt-4 text-sm font-medium"
          style={{ color: "var(--accent)" }}
        >
          ← Back to Inbox
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6" style={{ borderColor: "var(--line)" }}>
      <button
        onClick={() => setView("inbox")}
        className="mb-5 text-sm font-medium"
        style={{ color: "var(--accent)" }}
      >
        ← Back to Inbox
      </button>

      <h2 className="mb-4 text-xl font-medium tracking-tight">Compose</h2>


      <div className="space-y-3">
        <input
          type="email"
          placeholder="To"
          value={composeDraft.to}
          onChange={(e) => setComposeDraft({ to: e.target.value })}
          className={inputClass}
          style={{ borderColor: "var(--line)" }}
        />
        <input
          type="text"
          placeholder="Subject"
          value={composeDraft.subject}
          onChange={(e) => setComposeDraft({ subject: e.target.value })}
          className={inputClass}
          style={{ borderColor: "var(--line)" }}
        />
        <textarea
          placeholder="Write your message…"
          value={composeDraft.body}
          onChange={(e) => setComposeDraft({ body: e.target.value })}
          rows={10}
          className={inputClass}
          style={{ borderColor: "var(--line)" }}
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSend}
        disabled={sending || !composeDraft.to || !composeDraft.subject}

        className="mt-4 rounded-full px-6 py-2.5 text-sm font-medium text-white disabled:opacity-40"
        style={{ backgroundColor: "var(--accent)" }}
      >
        {sending ? "Sending…" : "Send"}
      </button>
    </div>
  );
}