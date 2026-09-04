import { createClient } from "@/lib/supabase/server";
import { statuses, type ClientStatus } from "@/lib/client-status";

export { statuses, type ClientStatus } from "@/lib/client-status";

export type Client = {
  id: string;
  student_name: string;
  status: ClientStatus;
  payer_contact_name: string | null;
  relationship_to_student: string | null;
  phone_whatsapp: string | null;
  school: string | null;
  grade_year: string | null;
  notes: string | null;
  created_at: string;
};

export type ListState = { query: string; status: "All" | ClientStatus };

export function listStateFromSearchParams(params: Record<string, string | string[] | undefined>): ListState {
  const query = typeof params.query === "string" ? params.query.trim() : "";
  const status = typeof params.status === "string" && statuses.includes(params.status as ClientStatus)
    ? (params.status as ClientStatus)
    : "All";

  return { query, status };
}

export function listStateQuery({ query, status }: ListState) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (status !== "All") params.set("status", status);
  return params.toString();
}

export async function getClients(state: ListState) {
  const supabase = await createClient();
  let request = supabase
    .from("clients")
    .select("id, student_name, status, payer_contact_name, relationship_to_student, phone_whatsapp, school, grade_year, notes, created_at")
    .order("created_at", { ascending: false });

  if (state.query) request = request.ilike("student_name", `%${state.query}%`);
  if (state.status !== "All") request = request.eq("status", state.status);

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

export async function getClient(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, student_name, status, payer_contact_name, relationship_to_student, phone_whatsapp, school, grade_year, notes, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as Client | null;
}
