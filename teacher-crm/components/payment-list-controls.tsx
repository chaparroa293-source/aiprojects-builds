"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentListStateQuery, type PaymentListState, type PaymentRecency, type PaymentSort } from "@/lib/payment-shared";
import type { ClientOption } from "@/lib/schedule-shared";

export function PaymentListControls({ state, clients }: { state: PaymentListState; clients: ClientOption[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const input = useRef<HTMLInputElement>(null);
  const timeout = useRef<number | undefined>(undefined);
  const current = { query: params.get("query") ?? state.query, clientId: params.get("client") ?? state.clientId, recency: (params.get("recency") ?? state.recency) as PaymentRecency, sort: (params.get("sort") ?? state.sort) as PaymentSort };
  useEffect(() => { if (input.current) input.current.value = current.query; }, [current.query]);
  useEffect(() => () => window.clearTimeout(timeout.current), []);
  function navigate(next: PaymentListState) { window.clearTimeout(timeout.current); const query = paymentListStateQuery(next); router.replace(query ? `/payments?${query}` : "/payments", { scroll: false }); }
  function search(query: string) { window.clearTimeout(timeout.current); timeout.current = window.setTimeout(() => navigate({ ...current, query: query.trim() }), 250); }
  const filtered = Boolean(current.query || current.clientId || current.recency !== "all" || current.sort !== "recent");
  return <div className="list-controls" role="search">
    <label className="search-field"><span className="visually-hidden">Search by Client name</span><svg className="search-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg><input ref={input} defaultValue={current.query} placeholder="Search by Client name…" onChange={(event) => search(event.target.value)} /></label>
    <label className="sort-field"><span>Client:</span><select value={current.clientId} onChange={(event) => navigate({ ...current, clientId: event.target.value })}><option value="">All</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.student_name}</option>)}</select></label>
    <label className="sort-field"><span>Date:</span><select value={current.recency} onChange={(event) => navigate({ ...current, recency: event.target.value as PaymentRecency })}><option value="all">All time</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select></label>
    <label className="sort-field"><span>Sort:</span><select value={current.sort} onChange={(event) => navigate({ ...current, sort: event.target.value as PaymentSort })}><option value="recent">Most recent</option><option value="oldest">Oldest</option><option value="client-asc">Client A–Z</option><option value="client-desc">Client Z–A</option><option value="amount-desc">Amount high–low</option><option value="amount-asc">Amount low–high</option></select></label>
    {filtered && <button className="clear-link" type="button" onClick={() => { if (input.current) input.current.value = ""; navigate({ query: "", clientId: "", recency: "all", sort: "recent" }); }}>Clear</button>}
  </div>;
}
