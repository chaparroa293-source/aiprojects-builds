export function formatGuarani(amount: number | bigint) {
  return `₲${new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(amount)}`;
}

export const paymentSorts = ["recent", "oldest", "client-asc", "client-desc", "amount-desc", "amount-asc"] as const;
export const paymentRecencies = ["all", "30", "90"] as const;
export type PaymentSort = (typeof paymentSorts)[number];
export type PaymentRecency = (typeof paymentRecencies)[number];
export type PaymentListState = { query: string; clientId: string; recency: PaymentRecency; sort: PaymentSort };

export function paymentListStateFromSearchParams(params: Record<string, string | string[] | undefined>): PaymentListState {
  return {
    query: typeof params.query === "string" ? params.query.trim() : "",
    clientId: typeof params.client === "string" ? params.client : "",
    recency: typeof params.recency === "string" && paymentRecencies.includes(params.recency as PaymentRecency) ? params.recency as PaymentRecency : "all",
    sort: typeof params.sort === "string" && paymentSorts.includes(params.sort as PaymentSort) ? params.sort as PaymentSort : "recent",
  };
}

export function paymentListStateQuery(state: PaymentListState) {
  const params = new URLSearchParams();
  if (state.query) params.set("query", state.query);
  if (state.clientId) params.set("client", state.clientId);
  if (state.recency !== "all") params.set("recency", state.recency);
  if (state.sort !== "recent") params.set("sort", state.sort);
  return params.toString();
}

export function paymentReturnPath(value: unknown) {
  return typeof value === "string" && (/^\/(?:payments|schedule|clients\/[0-9a-f-]+)(?:\?[^#]*)?$/i.test(value) || value === "/home" || value === "/dashboard") ? value : "/payments";
}
