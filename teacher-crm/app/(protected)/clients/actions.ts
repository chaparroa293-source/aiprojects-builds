"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { statuses, type ClientStatus } from "@/lib/client-status";
import { createClient } from "@/lib/supabase/server";

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
  if (!statuses.includes(status as ClientStatus)) throw new Error("Invalid client status.");

  const studentName = String(formData.get("student_name") ?? "").trim();
  if (!studentName) throw new Error("Student Name is required.");

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

export async function createClientRecord(formData: FormData) {
  const { supabase, user } = await currentUser();
  const { error } = await supabase.from("clients").insert({ ...clientValues(formData), user_id: user.id });
  if (error) throw new Error(error.message);

  const returnTo = safeReturnPath(formData);
  revalidatePath("/clients");
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
  return data as { id: string; student_name: string };
}

export async function updateClientRecord(id: string, formData: FormData) {
  const { supabase } = await currentUser();
  const { error } = await supabase.from("clients").update(clientValues(formData)).eq("id", id);
  if (error) throw new Error(error.message);

  const returnTo = safeReturnPath(formData);
  revalidatePath("/clients");
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
  revalidatePath(`/clients/${id}`);
  redirect(returnTo);
}
