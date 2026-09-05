"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { statuses, type ClientStatus } from "@/lib/client-status";
import type { ClientSort, ListState } from "@/lib/clients";

const clientSorts: ClientSort[] = ["alphabetical", "name-desc", "status-asc", "status-desc", "recent", "oldest"];

export function ClientListControls({ state }: { state: ListState }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const timeout = useRef<number | undefined>(undefined);
  const query = searchParams.get("query") ?? state.query;
  useEffect(() => { if (input.current) input.current.value = query; }, [query]);
  useEffect(() => () => window.clearTimeout(timeout.current), []);
  const selectedStatuses = (searchParams.get("status") ?? state.statuses.join(","))
    .split(",")
    .filter((status): status is ClientStatus => statuses.includes(status as ClientStatus));
  const sortParam = searchParams.get("sort");
  const sort: ClientSort = clientSorts.includes(sortParam as ClientSort)
    ? (sortParam as ClientSort)
    : state.sort;

  function navigate(nextQuery: string, nextStatuses: ClientStatus[], nextSort: ClientSort) {
    window.clearTimeout(timeout.current);
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set("query", nextQuery.trim());
    if (nextStatuses.length) params.set("status", nextStatuses.join(","));
    if (nextSort !== "recent") params.set("sort", nextSort);
    const suffix = params.toString();
    router.replace(suffix ? `/clients?${suffix}` : "/clients", { scroll: false });
  }

  function handleSearch(nextQuery: string) {
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => navigate(nextQuery, selectedStatuses, sort), 250);
  }

  function handleStatus(status: ClientStatus, checked: boolean) {
    window.clearTimeout(timeout.current);
    const nextStatuses = checked
      ? statuses.filter((candidate) => candidate === status || selectedStatuses.includes(candidate))
      : selectedStatuses.filter((candidate) => candidate !== status);
    navigate(input.current?.value ?? query, nextStatuses, sort);
  }

  function clear() {
    window.clearTimeout(timeout.current);
    if (input.current) input.current.value = "";
    navigate("", [], "recent");
  }

  const hasFilters = Boolean(query || selectedStatuses.length || sort !== "recent");
  const statusLabel = selectedStatuses.length === 0 || selectedStatuses.length === statuses.length
    ? "All"
    : selectedStatuses.length === 1
      ? selectedStatuses[0]
      : `${selectedStatuses.length} selected`;

  return (
    <div className="list-controls" role="search">
      <label className="search-field">
        <span className="visually-hidden">Search by student name</span>
        <svg className="search-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
        <input
          defaultValue={query}
          name="query"
          onChange={(event) => handleSearch(event.target.value)}
          placeholder="Search by student name…"
          ref={input}
        />
      </label>
      <details className="filter-menu">
        <summary>Status: <strong>{statusLabel}</strong></summary>
        <div className="filter-checklist">
          {statuses.map((status) => (
            <label key={status}>
              <input
                checked={selectedStatuses.includes(status)}
                onChange={(event) => handleStatus(status, event.target.checked)}
                type="checkbox"
              />
              <span>{status}</span>
            </label>
          ))}
        </div>
      </details>
      <label className="sort-field">
        <span>Sort:</span>
        <select value={sort} onChange={(event) => navigate(input.current?.value ?? query, selectedStatuses, event.target.value as ClientSort)}>
          <option value="alphabetical">Alphabetical A–Z</option>
          <option value="name-desc">Alphabetical Z–A</option>
          <option value="status-asc">Status A–Z</option>
          <option value="status-desc">Status Z–A</option>
          <option value="recent">Most recent</option>
          <option value="oldest">Oldest</option>
        </select>
      </label>
      {hasFilters ? (
        <button className="clear-link" onClick={clear} type="button">Clear</button>
      ) : null}
    </div>
  );
}
