"use client";

import { useUIStore } from "@/store/uiStore";

export default function FilterBar() {
  const { filters, setFilters } = useUIStore();

  const inputClass =
    "rounded-full border bg-white px-3.5 py-1.5 text-sm placeholder:text-[var(--ink)]/35 focus:outline-none focus:ring-1";

  return (
    <div className="flex flex-wrap items-center gap-2 pb-1">
      <input
        type="text"
        placeholder="From"
        value={filters.sender ?? ""}
        onChange={(e) => setFilters({ sender: e.target.value })}
        className={inputClass}
        style={{ borderColor: "var(--line)" }}
      />
      <input
        type="text"
        placeholder="Keyword"
        value={filters.keyword ?? ""}
        onChange={(e) => setFilters({ keyword: e.target.value })}
        className={inputClass}
        style={{ borderColor: "var(--line)" }}
      />
      <input
        type="date"
        value={filters.dateFrom ?? ""}
        onChange={(e) => setFilters({ dateFrom: e.target.value })}

        className={inputClass}
        style={{ borderColor: "var(--line)" }}
      />
      <input
        type="date"
        value={filters.dateTo ?? ""}
        onChange={(e) => setFilters({ dateTo: e.target.value })}
        className={inputClass}
        style={{ borderColor: "var(--line)" }}
      />
      <label className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm text-[var(--ink)]/70" style={{ borderColor: "var(--line)" }}>
        <input
          type="checkbox"
          checked={filters.unreadOnly ?? false}
          onChange={(e) => setFilters({ unreadOnly: e.target.checked })}
        />
        Unread
      </label>
      <button
        onClick={() => setFilters({ sender: "", keyword: "", dateFrom: "", dateTo: "", unreadOnly: false })}
        className="text-sm font-medium"
        style={{ color: "var(--accent)" }}
      >
        Clear
      </button>
    </div>
  );
}