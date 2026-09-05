"use client";

import { useState } from "react";
import { useUIStore } from "@/store/uiStore";
import { useCopilotAction } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import Inbox from "@/components/Inbox";
import Sent from "@/components/Sent";
import EmailDetail from "@/components/EmailDetail";
import Compose from "@/components/Compose";

export default function HomeShell() {
  const { view, setView, setComposeDraft } = useUIStore();
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  async function enableSync() {
    setSyncStatus("Enabling…");
    const res = await fetch("/api/gmail/watch", { method: "POST" });
    const data = await res.json();
    setSyncStatus(res.ok ? "Real-time sync enabled" : `Error: ${data.error}`);
  }

  useCopilotAction({
    name: "open_compose",
    description: "Open the compose view to write an email, optionally pre-filled with recipient, subject, and/or body",
    parameters: [
      { name: "to", type: "string", required: false, description: "Recipient email address" },
      { name: "subject", type: "string", required: false, description: "Email subject line" },
      { name: "body", type: "string", required: false, description: "Email body content" },
    ],
    handler: async ({ to, subject, body }) => {
      setView("compose");

      setComposeDraft({ to: to ?? "", subject: subject ?? "", body: body ?? "" });
      return "Compose view opened and filled in.";
    },
  });

  const tabs: { key: "inbox" | "sent"; label: string }[] = [
    { key: "inbox", label: "Inbox" },
    { key: "sent", label: "Sent" },
  ];

  return (
    <CopilotSidebar labels={{ title: "Mail Assistant", initial: "How can I help with your mail today?" }}>
      <main className="min-h-screen" style={{ backgroundColor: "var(--paper)" }}>
        <header className="sticky top-0 z-10 border-b bg-[var(--paper)]/95 backdrop-blur px-6 py-4"
          style={{ borderColor: "var(--line)" }}>
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                N
              </div>
              <h1 className="text-lg font-medium tracking-tight">Nebula Mail</h1>
            </div>

            <nav className="flex items-center gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setView(tab.key)}
                  className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"

                  style={
                    view === tab.key
                      ? { backgroundColor: "var(--accent-soft)", color: "var(--accent)" }
                      : { color: "#6b6862" }
                  }
                >
                  {tab.label}
                </button>
              ))}

              <span className="mx-2 h-5 w-px" style={{ backgroundColor: "var(--line)" }} />

              <button
                onClick={enableSync}
                className="rounded-full border px-4 py-1.5 text-sm font-medium text-[var(--ink)]/70 hover:bg-black/[0.03]"
                style={{ borderColor: "var(--line)" }}
              >
                Live sync
              </button>
              <button
                onClick={() => setView("compose")}
                className="rounded-full px-4 py-1.5 text-sm font-medium text-white"
                style={{ backgroundColor: "var(--accent)" }}
              >
                Compose
              </button>
            </nav>
          </div>
        </header>

        {syncStatus && (
          <div className="mx-auto max-w-5xl px-6 pt-3">

            <p className="rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: "var(--accent-soft)", color: "var(--accent)" }}>
              {syncStatus}
            </p>
          </div>
        )}

        <div className="mx-auto max-w-5xl px-6 py-4">
          {view === "inbox" && <Inbox />}
          {view === "sent" && <Sent />}
          {view === "detail" && <EmailDetail />}
          {view === "compose" && <Compose />}
        </div>
      </main>
    </CopilotSidebar>
  );
}