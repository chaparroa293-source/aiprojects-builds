import { createClient } from "@/lib/supabase/server";
import { addDays, type ClientOption, type RegularScheduleSlot, type TutoringClass } from "@/lib/schedule-shared";

type RawClass = Omit<TutoringClass, "client"> & {
  client: { student_name: string } | Array<{ student_name: string }>;
};

function normalizeClass(value: RawClass): TutoringClass {
  return {
    ...value,
    client: Array.isArray(value.client) ? value.client[0] : value.client,
  };
}

const classSelection = "id, client_id, class_date, start_time, duration_minutes, status, class_topic, notes, created_at, client:clients!classes_client_owner_fkey(student_name)";

export async function getWeekClasses(weekStart: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(classSelection)
    .gte("class_date", weekStart)
    .lte("class_date", addDays(weekStart, 6))
    .order("class_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as RawClass[]).map(normalizeClass);
}

export async function getTutoringClass(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(classSelection)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? normalizeClass(data as unknown as RawClass) : null;
}

export async function getClassFormOptions() {
  const supabase = await createClient();
  const [clientsResult, slotsResult] = await Promise.all([
    supabase.from("clients").select("id, student_name").order("student_name", { ascending: true }),
    supabase.from("regular_schedule_slots").select("id, client_id, weekday, start_time, duration_minutes").order("weekday").order("start_time"),
  ]);

  if (clientsResult.error) throw new Error(clientsResult.error.message);
  if (slotsResult.error) throw new Error(slotsResult.error.message);
  return {
    clients: (clientsResult.data ?? []) as ClientOption[],
    slots: (slotsResult.data ?? []) as RegularScheduleSlot[],
  };
}

export async function getClientSchedule(clientId: string) {
  const supabase = await createClient();
  const [classesResult, slotsResult] = await Promise.all([
    supabase.from("classes").select(classSelection).eq("client_id", clientId).order("class_date").order("start_time"),
    supabase.from("regular_schedule_slots").select("id, client_id, weekday, start_time, duration_minutes").eq("client_id", clientId).order("weekday").order("start_time"),
  ]);

  if (classesResult.error) throw new Error(classesResult.error.message);
  if (slotsResult.error) throw new Error(slotsResult.error.message);
  return {
    classes: ((classesResult.data ?? []) as unknown as RawClass[]).map(normalizeClass),
    slots: (slotsResult.data ?? []) as RegularScheduleSlot[],
  };
}

export async function getRegularScheduleSlot(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regular_schedule_slots")
    .select("id, client_id, weekday, start_time, duration_minutes")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as RegularScheduleSlot | null;
}
