import { create } from "zustand";

export type View = "inbox" | "sent" | "compose" | "detail";

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

interface Filters {
  dateFrom?: string;
  dateTo?: string;
  sender?: string;
  keyword?: string;
  unreadOnly?: boolean;
}

interface ComposeDraft {
  to: string;
  subject: string;
  body: string;
  threadId?: string;
}

interface UIState {
  view: View;
  emails: Email[];
  filters: Filters;
  openEmailId: string | null;
  composeDraft: ComposeDraft;
  setView: (v: View) => void;
  setEmails: (e: Email[]) => void;
  setFilters: (f: Partial<Filters>) => void;
  setOpenEmailId: (id: string | null) => void;
  setComposeDraft: (d: Partial<ComposeDraft>) => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: "inbox",
  emails: [],
  filters: {},
  openEmailId: null,
  composeDraft: { to: "", subject: "", body: "" },
  setView: (view) => set({ view }),
  setEmails: (emails) => set({ emails }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  setOpenEmailId: (openEmailId) => set({ openEmailId }),
  setComposeDraft: (draft) =>
    set((s) => ({ composeDraft: { ...s.composeDraft, ...draft } })),
}));
export function buildGmailQuery(filters: {
  dateFrom?: string;
  dateTo?: string;
  sender?: string;
  keyword?: string;
  unreadOnly?: boolean;
}, baseFolder: "inbox" | "sent" = "inbox") {
  const parts = [`in:${baseFolder}`];

  if (filters.sender) parts.push(`from:${filters.sender}`);
  if (filters.keyword) parts.push(filters.keyword);
  if (filters.unreadOnly) parts.push("is:unread");
  if (filters.dateFrom) parts.push(`after:${filters.dateFrom.replace(/-/g, "/")}`);
  if (filters.dateTo) parts.push(`before:${filters.dateTo.replace(/-/g, "/")}`);

  return parts.join(" ");
}