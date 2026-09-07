"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { classReturnPath, classStatuses, validDate, weekdays, type ClassStatus } from "@/lib/schedule-shared";
import { createClient } from "@/lib/supabase/server";

export type ScheduleActionState = { error: string };
class ScheduleInputError extends Error {}

function optional(formData: FormData, name: string) {
  const value = String(formData.get(name) ?? "").trim();
  return value || null;
}

function safeReturnPath(formData: FormData) {
  return classReturnPath(formData.get("returnTo"));
}

function positiveInteger(formData: FormData, name: string) {
  const value = Number(formData.get(name));
  if (!Number.isInteger(value) || value <= 0) throw new ScheduleInputError("Duration must be a positive number of minutes.");
  return value;
}

function timeValue(formData: FormData) {
  const value = String(formData.get("start_time") ?? "");
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new ScheduleInputError("A valid start time is required.");
  return value;
}

function classValues(formData: FormData) {
  const clientId = String(formData.get("client_id") ?? "");
  const classDate = String(formData.get("class_date") ?? "");
  const status = String(formData.get("status") ?? "Scheduled");
  if (!clientId) throw new ScheduleInputError("A client is required.");
  if (!validDate(classDate)) throw new ScheduleInputError("A valid class date is required.");
  if (!classStatuses.includes(status as ClassStatus)) throw new ScheduleInputError("Choose a valid class status.");
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
  if (!clientId) throw new ScheduleInputError("A client is required.");
  if (!weekdays.some((item) => item.value === weekday)) throw new ScheduleInputError("A valid weekday is required.");
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

async function ownedClientExists(clientId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.from("clients").select("id").eq("id", clientId).maybeSingle();
  return !error && Boolean(data);
}

function inputError(error: unknown) {
  if (error instanceof ScheduleInputError) return { error: error.message };
  throw error;
}

export async function createClassRecord(_state: ScheduleActionState, formData: FormData): Promise<ScheduleActionState> {
  let values;
  try { values = classValues(formData); } catch (error) { return inputError(error); }
  const { supabase, user } = await currentUser();
  if (!await ownedClientExists(values.client_id, supabase)) return { error: "That client is no longer available. Reload and choose again." };
  const { error } = await supabase.from("classes").insert({ ...values, user_id: user.id });
  if (error) return { error: "Class could not be saved. Check your connection and try again." };
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  revalidatePath("/home");
  revalidatePath(`/clients/${values.client_id}`);
  redirect(safeReturnPath(formData));
}

export async function updateClassRecord(id: string, _state: ScheduleActionState, formData: FormData): Promise<ScheduleActionState> {
  let values;
  try { values = classValues(formData); } catch (error) { return inputError(error); }
  const { supabase } = await currentUser();
  if (!await ownedClientExists(values.client_id, supabase)) return { error: "That client is no longer available. Reload and choose again." };
  const { data, error } = await supabase.from("classes").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
  if (error) return { error: "Class could not be saved. Check your connection and try again." };
  if (!data) return { error: "This class no longer exists. Return to Schedule and reload." };
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  revalidatePath("/home");
  revalidatePath(`/clients/${values.client_id}`);
  redirect(safeReturnPath(formData));
}

export async function createRegularScheduleSlot(_state: ScheduleActionState, formData: FormData): Promise<ScheduleActionState> {
  let values;
  try { values = slotValues(formData); } catch (error) { return inputError(error); }
  const { supabase, user } = await currentUser();
  if (!await ownedClientExists(values.client_id, supabase)) return { error: "That client is no longer available. Return to the client and reload." };
  const { error } = await supabase.from("regular_schedule_slots").insert({ ...values, user_id: user.id });
  if (error) return { error: "Regular time could not be saved. Check your connection and try again." };
  revalidatePath(`/clients/${values.client_id}`);
  redirect(safeReturnPath(formData));
}

export async function deleteClassRecord(id: string, formData: FormData) {
  const { supabase, user } = await currentUser();
  const { data, error } = await supabase.from("classes").delete().eq("id", id).eq("user_id", user.id).select("client_id").maybeSingle();
  if (error || !data) return { error: "Class could not be deleted. Check that the deletion migration has been applied, then try again." };
  revalidatePath("/schedule");
  revalidatePath("/dashboard");
  revalidatePath("/home");
  revalidatePath(`/clients/${data.client_id}`);
  redirect(safeReturnPath(formData));
}

export async function updateRegularScheduleSlot(id: string, _state: ScheduleActionState, formData: FormData): Promise<ScheduleActionState> {
  let values;
  try { values = slotValues(formData); } catch (error) { return inputError(error); }
  const { supabase } = await currentUser();
  if (!await ownedClientExists(values.client_id, supabase)) return { error: "That client is no longer available. Return to the client and reload." };
  const { data, error } = await supabase.from("regular_schedule_slots").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id).select("id").maybeSingle();
  if (error) return { error: "Regular time could not be saved. Check your connection and try again." };
  if (!data) return { error: "This regular time no longer exists. Return to the client and reload." };
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
