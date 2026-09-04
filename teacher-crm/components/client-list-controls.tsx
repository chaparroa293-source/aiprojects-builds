"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { statuses, type ClientStatus } from "@/lib/client-status";
import type { ListState } from "@/lib/clients";

export function ClientListControls({ state }: { state: ListState }) {
  const router = useRouter();
  const [query, setQuery] = useState(state.query);
  const [status, setStatus] = useState(state.status);
  const timeout = useRef<number | undefined>(undefined);

  function navigate(nextQuery: string, nextStatus: ListState["status"]) {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("query", nextQuery.trim());
    if (nextStatus !== "All") params.set("status", nextStatus);
    const suffix = params.toString();
    router.replace(suffix ? `/clients?${suffix}` : "/clients", { scroll: false });
  }

  function handleSearch(nextQuery: string) {
    setQuery(nextQuery);
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => navigate(nextQuery, status), 250);
  }

  function handleStatus(nextStatus: ListState["status"]) {
    window.clearTimeout(timeout.current);
    setStatus(nextStatus);
    navigate(query, nextStatus);
  }

  const hasFilters = Boolean(query || status !== "All");

  return (
    <div className="list-controls" role="search">
      <label className="search-field">
        <span className="visually-hidden">Search by student name</span>
        <svg className="search-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
        <input
          name="query"
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Search by student name…"
          value={query}
        />
      </label>
      <label className="filter-field">
        <span className="filter-label">Status:</span>
        <select
          name="status"
          onChange={(event) => handleStatus(event.target.value as "All" | ClientStatus)}
          value={status}
        >
          <option value="All">All</option>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      {hasFilters ? (
        <button className="clear-link" onClick={() => navigate("", "All")} type="button">Clear</button>
      ) : null}
    </div>
  );
}
