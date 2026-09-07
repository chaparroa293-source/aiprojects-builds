import { createClient } from "@/lib/supabase/server";
import { statuses } from "@/lib/client-status";
import { adjacentMonth, type ReviewClass, type ReviewPayment } from "@/lib/dashboard-shared";

export async function getMonthlyReview(month: string) {
  const supabase = await createClient();
  const first = `${month}-01`;
  const next = `${adjacentMonth(month, 1)}-01`;
  async function classesInMonth() {
    const items: ReviewClass[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase.from("classes").select("class_date, status").gte("class_date", first).lt("class_date", next).order("id").range(offset, offset + 499);
      if (error) throw new Error(error.message);
      items.push(...(data as ReviewClass[]));
      if (data.length < 500) return items;
    }
  }
  async function paymentsInMonth() {
    const items: ReviewPayment[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase.from("payments").select("payment_date, amount").gte("payment_date", first).lt("payment_date", next).order("id").range(offset, offset + 499);
      if (error) throw new Error(error.message);
      items.push(...data);
      if (data.length < 500) return items;
    }
  }
  const [classes, payments, clients] = await Promise.all([
    classesInMonth(), paymentsInMonth(),
    Promise.all(statuses.map(async (status) => {
      const { count, error } = await supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", status);
      if (error) throw new Error(error.message);
      return { status, count: count ?? 0 };
    })),
  ]);
  return { classes, payments, clients };
}
