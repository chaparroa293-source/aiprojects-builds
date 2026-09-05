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

export const clientSorts = ["alphabetical", "name-desc", "status-asc", "status-desc", "recent", "oldest"] as const;
export type ClientSort = (typeof clientSorts)[number];
export type ListState = { query: string; statuses: ClientStatus[]; sort: ClientSort };

export function listStateFromSearchParams(params: Record<string, string | string[] | undefined>): ListState {
  const query = typeof params.query === "string" ? params.query.trim() : "";
  const selectedStatuses = typeof params.status === "string"
    ? params.status.split(",").filter((status): status is ClientStatus => statuses.includes(status as ClientStatus))
    : [];
  const sort = typeof params.sort === "string" && clientSorts.includes(params.sort as ClientSort)
    ? (params.sort as ClientSort)
    : "recent";

  return { query, statuses: selectedStatuses, sort };
}

export function listStateQuery({ query, statuses: selectedStatuses, sort }: ListState) {
  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (selectedStatuses.length) params.set("status", selectedStatuses.join(","));
  if (sort !== "recent") params.set("sort", sort);
  return params.toString();
}

export async function getClients(state: ListState) {
  const supabase = await createClient();
  let request = supabase
    .from("clients")
    .select("id, student_name, status, payer_contact_name, relationship_to_student, phone_whatsapp, school, grade_year, notes, created_at");

  if (state.query) request = request.ilike("student_name", `%${state.query}%`);
  if (state.statuses.length) request = request.in("status", state.statuses);

  if (state.sort === "alphabetical") request = request.order("student_name", { ascending: true });
  if (state.sort === "name-desc") request = request.order("student_name", { ascending: false });
  if (state.sort === "status-asc" || state.sort === "status-desc") request = request.order("status", { ascending: state.sort === "status-asc" }).order("student_name");
  if (state.sort === "recent") request = request.order("created_at", { ascending: false });
  if (state.sort === "oldest") request = request.order("created_at", { ascending: true });

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

export async function getClientCount() {
  const supabase = await createClient();
  const { count, error } = await supabase.from("clients").select("id", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
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
