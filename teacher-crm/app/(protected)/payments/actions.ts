"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validDate } from "@/lib/schedule-shared";
import { paymentReturnPath } from "@/lib/payment-shared";

export async function savePayment(id: string | null, form: FormData) {
  const amount = Number(form.get("amount"));
  const date = String(form.get("payment_date") ?? "");
  const clientId = String(form.get("client_id") ?? "");
  if (!clientId) return { error: "Choose a Client." };
  if (!Number.isSafeInteger(amount) || amount <= 0) return { error: "Enter a positive whole-guaraní amount." };
  if (!validDate(date)) return { error: "Enter a valid payment date." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.rpc("save_payment", {
    p_id: id, p_client_id: clientId, p_amount: amount, p_payment_date: date,
    p_notes: String(form.get("notes") ?? "").trim() || null,
    p_class_ids: [...new Set(form.getAll("class_ids").map(String))],
  });
  if (error) return { error: error.message };
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/home");
  revalidatePath("/clients", "layout");
  revalidatePath("/schedule", "layout");
  redirect(paymentReturnPath(form.get("returnTo")));
}

export async function deletePayment(id: string, returnTo: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase.from("payments").delete().eq("id", id).eq("user_id", user.id).select("id").maybeSingle();
  if (error || !data) return { error: "Payment could not be deleted. Reload and try again." };
  revalidatePath("/payments");
  revalidatePath("/dashboard");
  revalidatePath("/home");
  revalidatePath("/clients", "layout");
  revalidatePath("/schedule", "layout");
  redirect(paymentReturnPath(returnTo));
}
