import { createClient } from "@/lib/supabase/server";
import { addDays, todayInProductTimezone } from "@/lib/schedule-shared";
import type { PaymentListState } from "@/lib/payment-shared";

export type Payment = {
  id: string; client_id: string; amount: number; payment_date: string; notes: string | null;
  client: { student_name: string }; classes: { count: number }[];
};
const selection = "id, client_id, amount, payment_date, notes, client:clients!payments_client_owner_fkey(student_name), classes:classes!classes_payment_client_owner_fkey(count)";

export function filterAndSortPayments(payments: Payment[], state: PaymentListState) {
  const lowerQuery = state.query.toLocaleLowerCase();
  const earliestDate = state.recency === "all" ? "" : addDays(todayInProductTimezone(), -Number(state.recency));
  return payments.filter((payment) =>
    (!lowerQuery || payment.client.student_name.toLocaleLowerCase().includes(lowerQuery)) &&
    (!state.clientId || payment.client_id === state.clientId) &&
    (!earliestDate || payment.payment_date >= earliestDate)
  ).sort((a, b) => {
    if (state.sort === "oldest") return a.payment_date.localeCompare(b.payment_date);
    if (state.sort === "client-asc" || state.sort === "client-desc") return a.client.student_name.localeCompare(b.client.student_name) * (state.sort === "client-asc" ? 1 : -1);
    if (state.sort === "amount-asc" || state.sort === "amount-desc") return (a.amount - b.amount) * (state.sort === "amount-asc" ? 1 : -1);
    return b.payment_date.localeCompare(a.payment_date);
  });
}

export async function getPayments(clientId?: string) {
  const supabase = await createClient();
  const payments: Payment[] = [];
  for (let offset = 0; ; offset += 500) {
    let query = supabase.from("payments").select(selection).order("payment_date", { ascending: false }).order("created_at", { ascending: false }).order("id").range(offset, offset + 499);
    if (clientId) query = query.eq("client_id", clientId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    payments.push(...((data ?? []) as unknown as Payment[]));
    if (!data || data.length < 500) return payments;
  }
}

export async function getRecentPayments(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payments")
    .select(selection)
    .order("payment_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Payment[];
}

export async function getPayment(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("payments").select(selection).eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as unknown as Payment | null;
}

export async function getPaymentFormOptions() {
  const supabase = await createClient();
  const clients: { id: string; student_name: string }[] = [];
  const classes: { id: string; client_id: string; class_date: string; start_time: string; status: string; class_topic: string | null; payment_id: string | null }[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("clients").select("id, student_name").order("student_name").order("id").range(offset, offset + 499);
    if (error) throw new Error(error.message);
    clients.push(...(data ?? []));
    if (!data || data.length < 500) break;
  }
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase.from("classes").select("id, client_id, class_date, start_time, status, class_topic, payment_id").order("class_date", { ascending: false }).order("start_time").order("id").range(offset, offset + 499);
    if (error) throw new Error(error.message);
    classes.push(...(data ?? []));
    if (!data || data.length < 500) break;
  }
  return { clients, classes };
}
