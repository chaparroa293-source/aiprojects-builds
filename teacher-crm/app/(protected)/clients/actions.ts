"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { statuses, type ClientStatus } from "@/lib/client-status";
import { createClient } from "@/lib/supabase/server";

export type ClientActionState = { error: string };

class ClientInputError extends Error {}

function optional(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

function safeReturnPath(formData: FormData) {
  const value = String(formData.get("returnTo") ?? "/clients");
  return value.startsWith("/clients") ? value : "/clients";
}

function clientValues(formData: FormData) {
  const status = String(formData.get("status") ?? "Prospect");
  if (!statuses.includes(status as ClientStatus)) throw new ClientInputError("Choose a valid client status.");

  const studentName = String(formData.get("student_name") ?? "").trim();
  if (!studentName) throw new ClientInputError("Student Name is required.");

  return {
    student_name: studentName,
    status: status as ClientStatus,
    payer_contact_name: optional(formData, "payer_contact_name"),
    relationship_to_student: optional(formData, "relationship_to_student"),
    phone_whatsapp: optional(formData, "phone_whatsapp"),
    school: optional(formData, "school"),
    grade_year: optional(formData, "grade_year"),
    notes: optional(formData, "notes"),
  };
}

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function createClientRecord(_state: ClientActionState, formData: FormData): Promise<ClientActionState> {
  const { supabase, user } = await currentUser();
  let values;
  try { values = clientValues(formData); } catch (error) {
    if (error instanceof ClientInputError) return { error: error.message };
    throw error;
  }
  const { error } = await supabase.from("clients").insert({ ...values, user_id: user.id });
  if (error) return { error: "Client could not be saved. Check your connection and try again." };

  const returnTo = safeReturnPath(formData);
  revalidatePath("/clients");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  redirect(returnTo);
}

export async function createClientInline(formData: FormData) {
  const { supabase, user } = await currentUser();
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...clientValues(formData), user_id: user.id })
    .select("id, student_name")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/clients");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  return data as { id: string; student_name: string };
}

export async function updateClientRecord(id: string, _state: ClientActionState, formData: FormData): Promise<ClientActionState> {
  const { supabase } = await currentUser();
  let values;
  try { values = clientValues(formData); } catch (error) {
    if (error instanceof ClientInputError) return { error: error.message };
    throw error;
  }
  const { data, error } = await supabase.from("clients").update(values).eq("id", id).select("id").maybeSingle();
  if (error) return { error: "Client could not be saved. Check your connection and try again." };
  if (!data) return { error: "This client no longer exists. Return to Clients and reload." };

  const returnTo = safeReturnPath(formData);
  revalidatePath("/clients");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  revalidatePath(`/clients/${id}`);
  redirect(returnTo);
}

export async function updateClientStatus(id: string, formData: FormData) {
  const { supabase } = await currentUser();
  const status = String(formData.get("status") ?? "");
  if (!statuses.includes(status as ClientStatus)) throw new Error("Invalid client status.");

  const { error } = await supabase.from("clients").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);

  const returnTo = safeReturnPath(formData);
  revalidatePath("/clients");
  revalidatePath("/home");
  revalidatePath("/dashboard");
  revalidatePath(`/clients/${id}`);
  redirect(returnTo);
}
