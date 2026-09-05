"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { classStatuses, validDate, weekdays, type ClassStatus } from "@/lib/schedule-shared";
import { createClient } from "@/lib/supabase/server";

function optional(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

function safeReturnPath(formData: FormData) {
  const value = String(formData.get("returnTo") ?? "/schedule");
  return value.startsWith("/schedule") || value.startsWith("/clients") ? value : "/schedule";
}

function positiveInteger(formData: FormData, name: string) {
  const value = Number(formData.get(name));
  if (!Number.isInteger(value) || value <= 0) throw new Error("Duration must be a positive number of minutes.");
  return value;
}

function timeValue(formData: FormData) {
  const value = String(formData.get("start_time") ?? "");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error("A valid start time is required.");
  return value;
}

function classValues(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const classDate = String(formData.get("class_date") ?? "");
  const status = String(formData.get("status") ?? "Scheduled");
  if (!clientId) throw new Error("A client is required.");
  if (!validDate(classDate)) throw new Error("A valid class date is required.");
  if (!classStatuses.includes(status as ClassStatus)) throw new Error("Invalid class status.");
  return {
    client_id: clientId,
    class_date: classDate,
    start_time: timeValue(formData),
    duration_minutes: positiveInteger(formData, "duration_minutes"),
    status: status as ClassStatus,
    class_topic: optional(formData, "class_topic"),
    notes: optional(formData, "notes"),
  };
}

function slotValues(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const weekday = Number(formData.get("weekday"));
  if (!clientId) throw new Error("A client is required.");
  if (!weekdays.some((item) => item.value === weekday)) throw new Error("A valid weekday is required.");
  return {
    client_id: clientId,
    weekday,
    start_time: timeValue(formData),
    duration_minutes: positiveInteger(formData, "duration_minutes"),
  };
}

async function currentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function assertOwnedClient(clientId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.from("clients").select("id").eq("id", clientId).maybeSingle();
  if (error || !data) throw new Error("Client not found.");
}

export async function createClassRecord(formData: FormData) {
  const values = classValues(formData);
  const { supabase, user } = await currentUser();
  await assertOwnedClient(values.client_id, supabase);
  const { error } = await supabase.from("classes").insert({ ...values, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath("/schedule");
  revalidatePath(`/clients/${values.client_id}`);
  redirect(safeReturnPath(formData));
}

export async function updateClassRecord(id: string, formData: FormData) {
  const values = classValues(formData);
  const { supabase } = await currentUser();
  await assertOwnedClient(values.client_id, supabase);
  const { error } = await supabase.from("classes").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/schedule");
  revalidatePath(`/clients/${values.client_id}`);
  redirect(safeReturnPath(formData));
}

export async function createRegularScheduleSlot(formData: FormData) {
  const values = slotValues(formData);
  const { supabase, user } = await currentUser();
  await assertOwnedClient(values.client_id, supabase);
  const { error } = await supabase.from("regular_schedule_slots").insert({ ...values, user_id: user.id });
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${values.client_id}`);
  redirect(safeReturnPath(formData));
}

export async function deleteClassRecord(id: string, formData: FormData) {
  const { supabase, user } = await currentUser();
  const { data, error } = await supabase.from("classes").delete().eq("id", id).eq("user_id", user.id).select("client_id").maybeSingle();
  if (error || !data) return { error: "Class could not be deleted. Check that the deletion migration has been applied, then try again." };
  revalidatePath("/schedule");
  revalidatePath(`/clients/${data.client_id}`);
  redirect(safeReturnPath(formData));
}

export async function updateRegularScheduleSlot(id: string, formData: FormData) {
  const values = slotValues(formData);
  const { supabase } = await currentUser();
  await assertOwnedClient(values.client_id, supabase);
  const { error } = await supabase.from("regular_schedule_slots").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${values.client_id}`);
  redirect(safeReturnPath(formData));
}

export async function removeRegularScheduleSlot(id: string, formData: FormData) {
  const { supabase } = await currentUser();
  const { error } = await supabase.from("regular_schedule_slots").delete().eq("id", id);
  if (error) throw new Error(error.message);
  const returnTo = safeReturnPath(formData);
  revalidatePath(returnTo.split("?")[0]);
  redirect(returnTo);
}
