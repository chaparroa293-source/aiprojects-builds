import { addDays, startOfWeek, type ClassStatus } from "./schedule-shared";

export type ReviewClass = { class_date: string; status: ClassStatus };
export type ReviewPayment = { payment_date: string; amount: number | string };

export function reviewMonth(value: unknown, today: string) {
  return typeof value === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(value) && value >= "1900-01" && value <= "9998-12" ? value : today.slice(0, 7);
}

export function adjacentMonth(month: string, direction: number) {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + direction);
  return date.toISOString().slice(0, 7);
}

// Each Monday–Sunday bucket is clipped to the selected calendar month.
export function reviewWeeks(month: string, classes: ReviewClass[], payments: ReviewPayment[]) {
  const first = `${month}-01`;
  const last = addDays(`${adjacentMonth(month, 1)}-01`, -1);
  const weeks: { start: string; end: string; classes: number; received: bigint }[] = [];
  for (let week = startOfWeek(first); week <= last; week = addDays(week, 7)) {
    const start = week < first ? first : week;
    const end = addDays(week, 6) > last ? last : addDays(week, 6);
    weeks.push({
      start, end,
      classes: classes.filter((item) => item.class_date >= start && item.class_date <= end).length,
      received: payments.filter((item) => item.payment_date >= start && item.payment_date <= end).reduce((sum, item) => sum + BigInt(item.amount), BigInt(0)),
    });
  }
  return weeks;
}
