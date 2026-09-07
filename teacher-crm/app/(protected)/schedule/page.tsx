import { WorkspaceMotif } from "@/components/workspace-motif";
import Link from "next/link";

import { ClassStatusChip } from "@/components/class-status-chip";
import { ClassPaymentStatusChip } from "@/components/class-payment-status-chip";
import { DeleteClassControl } from "@/components/delete-class-control";
import { getWeekClasses } from "@/lib/schedule";
import { addDays, formatDate, formatTime, endTime, isClassOutcomeUnresolved, isClassPaymentStatusRelevant, nowInProductTimezone, startOfWeek, todayInProductTimezone, validDate, weekdayLabel } from "@/lib/schedule-shared";

export const dynamic = "force-dynamic";

export default async function SchedulePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = (await searchParams).week;
  const requested = typeof raw === "string" && validDate(raw) ? raw : todayInProductTimezone();
  const weekStart = startOfWeek(requested);
  const weekEnd = addDays(weekStart, 6);
  const classes = await getWeekClasses(weekStart);
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const returnTo = `/schedule?week=${weekStart}`;
  const today = todayInProductTimezone();
  const now = nowInProductTimezone();
  const newClassDate = startOfWeek(today) === weekStart ? today : weekStart;

  return <section className="schedule-page" aria-labelledby="schedule-title">
    <div className="page-heading schedule-heading"><div><p className="workspace-kicker">Make space for good teaching</p><h1 id="schedule-title" className="editorial-title">Schedule<span className="title-period">.</span></h1><p>{formatDate(weekStart, { month: "long", day: "numeric" })} – {formatDate(weekEnd, { month: "long", day: "numeric", year: "numeric" })}</p></div><Link className="button button-primary" href={`/schedule/classes/new?date=${newClassDate}&returnTo=${encodeURIComponent(returnTo)}`}>+ Add Class</Link></div>
    <nav className="week-navigation" aria-label="Week navigation"><Link className="button button-secondary" href={`/schedule?week=${addDays(weekStart, -7)}`}>← Previous</Link><Link className="button button-secondary" href="/schedule">Today</Link><Link className="button button-secondary" href={`/schedule?week=${addDays(weekStart, 7)}`}>Next →</Link></nav>
    <div className="week-caption"><span>Monday — Sunday</span><span>{classes.length} {classes.length === 1 ? "class" : "classes"} this week</span></div><div className="week-agenda">
      {days.map((day) => {
        const dayClasses = classes.filter((item) => item.class_date === day);
        return <section className={`agenda-day${dayClasses.length ? " agenda-day-active" : " agenda-day-clear"}${day === today ? " agenda-day-today" : ""}`} aria-labelledby={`day-${day}`} key={day}>
          <header><div className="day-label"><h2 id={`day-${day}`}>{weekdayLabel(new Date(`${day}T12:00:00Z`).getUTCDay() || 7)}</h2><span>{formatDate(day, { month: "short", day: "numeric" })}</span>{day === today && <small className="today-label">Today</small>}</div><Link className="day-add" href={`/schedule/classes/new?date=${day}&returnTo=${encodeURIComponent(returnTo)}`} aria-label={`Add class on ${formatDate(day, { weekday: "long", month: "short", day: "numeric" })}`} title="Add class">+</Link></header>
          {dayClasses.length ? <div className="agenda-rows">{dayClasses.map((item) => <article className="agenda-row" key={item.id}>
            <Link className="agenda-class-link" href={`/schedule/classes/${item.id}/edit?returnTo=${encodeURIComponent(returnTo)}`} aria-label={`Edit ${item.client.student_name} class`} />
            <div className="agenda-identity"><Link className="agenda-student" href={`/clients/${item.client_id}`}>{item.client.student_name}</Link>{item.class_topic && <span className="agenda-topic">{item.class_topic}</span>}</div>
            <span className="agenda-time">
              <span>{formatTime(item.start_time)}–{endTime(item.start_time, item.duration_minutes)}</span>
              <small>{item.duration_minutes} min</small>
            </span>
            <span className="agenda-statuses"><ClassStatusChip status={item.status} needsOutcome={isClassOutcomeUnresolved(item, now)} />{isClassPaymentStatusRelevant(item, now) && <ClassPaymentStatusChip paymentId={item.payment_id} href={item.payment_id ? `/payments/${item.payment_id}/edit?returnTo=${encodeURIComponent(returnTo)}` : undefined} />}</span>
            <span className="agenda-notes">{item.notes || ""}</span>
            <DeleteClassControl id={item.id} returnTo={returnTo} compact />
          </article>)}</div> : <p className="agenda-empty"><span aria-hidden="true">—</span> A clear day</p>}
        </section>;
      })}
    </div>
    {!classes.length && <div className="schedule-empty"><WorkspaceMotif kind="calendar" /><div><p>A little room in your week.</p><span>No classes scheduled yet.</span><Link className="text-button" href={`/schedule/classes/new?date=${newClassDate}&returnTo=${encodeURIComponent(returnTo)}`}>Add Class</Link></div></div>}
  </section>;
}
