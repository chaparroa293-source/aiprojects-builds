export const PRODUCT_TIME_ZONE = "America/Asuncion";
export const classStatuses = ["Scheduled", "Completed", "Cancelled", "Missed"] as const;
export type ClassStatus = (typeof classStatuses)[number];

export const weekdays = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
] as const;

export type TutoringClass = {
  payment_id: string | null;
  id: string;
  client_id: string;
  class_date: string;
  start_time: string;
  duration_minutes: number;
  status: ClassStatus;
  class_topic: string | null;
  notes: string | null;
  created_at: string;
  client: { student_name: string };
};

export type RegularScheduleSlot = {
  id: string;
  client_id: string;
  weekday: number;
  start_time: string;
  duration_minutes: number;
};

export type ClientOption = { id: string; student_name: string };

function utcDate(date: string) {
  return new Date(`${date}T12:00:00Z`);
}

export function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number) {
  const value = utcDate(date);
  value.setUTCDate(value.getUTCDate() + days);
  return dateString(value);
}

export function todayInProductTimezone() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PRODUCT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function nowInProductTimezone() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: PRODUCT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function isClassPaymentStatusRelevant(
  tutoringClass: Pick<TutoringClass, "class_date" | "start_time" | "status">,
  now = nowInProductTimezone(),
) {
  return tutoringClass.status === "Completed" || hasClassTimeArrived(tutoringClass, now);
}

export function hasClassTimeArrived(
  tutoringClass: Pick<TutoringClass, "class_date" | "start_time">,
  now = nowInProductTimezone(),
) {
  return `${tutoringClass.class_date}T${formatTime(tutoringClass.start_time)}` <= now;
}

export function isClassOutcomeUnresolved(
  tutoringClass: Pick<TutoringClass, "class_date" | "start_time" | "status">,
  now = nowInProductTimezone(),
) {
  return tutoringClass.status === "Scheduled" && hasClassTimeArrived(tutoringClass, now);
}

export function startOfWeek(date: string) {
  const day = utcDate(date).getUTCDay() || 7;
  return addDays(date, 1 - day);
}

export function validDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = utcDate(value);
  return Number.isFinite(date.getTime()) && dateString(date) === value;
}

export function classReturnPath(value: unknown) {
  if (typeof value !== "string") return "/schedule";
  if (value === "/home" || value === "/dashboard") return value;
  return value.startsWith("/schedule") || value.startsWith("/clients") ? value : "/schedule";
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...options,
  }).format(utcDate(date));
}

export function formatTime(time: string) {
  return time.slice(0, 5);
}

export function endTime(startTime: string, durationMinutes: number) {
  const [hours, minutes] = formatTime(startTime).split(":").map(Number);
  const total = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(total / 60) % 24;
  const endMinutes = total % 60;
  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
}

export function weekdayLabel(weekday: number) {
  return weekdays.find((item) => item.value === weekday)?.label ?? "";
}

export function dateForWeekdayOnOrAfter(date: string, weekday: number) {
  const currentWeekday = utcDate(date).getUTCDay() || 7;
  const difference = (weekday - currentWeekday + 7) % 7;
  return addDays(date, difference);
}
