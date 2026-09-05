"use client";

import { useEffect, useState } from "react";
import { useUIStore, Email } from "@/store/uiStore";

export default function Sent() {
  const { setOpenEmailId, setView } = useUIStore();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSent() {
      setLoading(true);
      const res = await fetch("/api/gmail/list?q=in:sent&maxResults=20");
      const data = await res.json();
      if (Array.isArray(data)) setEmails(data);
      setLoading(false);
    }
    fetchSent();
  }, []);

  function openEmail(email: Email) {
    setOpenEmailId(email.id);
    setView("detail");
  }

  if (loading) return <p className="p-4 text-neutral-500">Loading sent…</p>;
  if (emails.length === 0) return <p className="p-4 text-neutral-500">No sent emails found.</p>;

  return (
    <ul className="divide-y divide-neutral-200">
      {emails.map((email) => (
        <li
          key={email.id}
          onClick={() => openEmail(email)}
          className="cursor-pointer px-4 py-3 text-neutral-600 hover:bg-neutral-100"
        >
          <div className="flex justify-between text-sm">
            <span className="truncate">To: {email.to}</span>
            <span className="ml-2 shrink-0 text-xs text-neutral-400">
              {new Date(email.date).toLocaleDateString()}
            </span>
          </div>
          <div className="truncate text-sm">{email.subject}</div>
          <div className="truncate text-xs text-neutral-400">{email.snippet}</div>
        </li>
      ))}
    </ul>
  );
}