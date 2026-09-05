import Link from "next/link";

import { ClassStatusChip } from "@/components/class-status-chip";
import { DeleteClassControl } from "@/components/delete-class-control";
import { getWeekClasses } from "@/lib/schedule";
import { addDays, formatDate, formatTime, endTime, startOfWeek, todayInProductTimezone, validDate } from "@/lib/schedule-shared";

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
  const newClassDate = startOfWeek(today) === weekStart ? today : weekStart;

  return <section className="schedule-page" aria-labelledby="schedule-title">
    <div className="page-heading schedule-heading"><div><h1 id="schedule-title">Schedule</h1><p>{formatDate(weekStart, { month: "long", day: "numeric" })} – {formatDate(weekEnd, { month: "long", day: "numeric", year: "numeric" })}</p></div><Link className="button button-primary" href={`/schedule/classes/new?date=${newClassDate}&returnTo=${encodeURIComponent(returnTo)}`}>+ Add Class</Link></div>
    <nav className="week-navigation" aria-label="Week navigation"><Link className="button button-secondary" href={`/schedule?week=${addDays(weekStart, -7)}`}>← Previous</Link><Link className="button button-secondary" href="/schedule">Today</Link><Link className="button button-secondary" href={`/schedule?week=${addDays(weekStart, 7)}`}>Next →</Link></nav>
    <div className="week-agenda">
      {days.map((day) => {
        const dayClasses = classes.filter((item) => item.class_date === day);
        return <section className="agenda-day" aria-labelledby={`day-${day}`} key={day}>
          <header><div className="day-label"><h2 id={`day-${day}`}>{formatDate(day, { weekday: "long" })}</h2><span>{formatDate(day, { month: "short", day: "numeric" })}</span></div><Link className="day-add" href={`/schedule/classes/new?date=${day}&returnTo=${encodeURIComponent(returnTo)}`} aria-label={`Add class on ${formatDate(day, { weekday: "long", month: "short", day: "numeric" })}`} title="Add class">+</Link></header>
          {dayClasses.length ? <div className="agenda-rows">{dayClasses.map((item) => <article className="agenda-row" key={item.id}>
            <Link className="agenda-class-link" href={`/schedule/classes/${item.id}/edit?returnTo=${encodeURIComponent(returnTo)}`} aria-label={`Edit ${item.client.student_name} class`} />
            <div className="agenda-identity">{item.class_topic && <strong className="agenda-topic">{item.class_topic}</strong>}<Link className="agenda-student" href={`/clients/${item.client_id}`}>{item.client.student_name}</Link></div>
            <span className="agenda-time">{formatTime(item.start_time)}–{endTime(item.start_time, item.duration_minutes)}</span>
            <ClassStatusChip status={item.status} />
            <span className="agenda-notes">{item.notes || ""}</span>
            <span className="row-arrow" aria-hidden="true">›</span>
            <DeleteClassControl id={item.id} returnTo={returnTo} compact />
          </article>)}</div> : <p className="agenda-empty">No classes</p>}
        </section>;
      })}
    </div>
    {!classes.length && <div className="schedule-empty"><p>No classes this week.</p><Link className="text-button" href={`/schedule/classes/new?date=${newClassDate}&returnTo=${encodeURIComponent(returnTo)}`}>Add Class</Link></div>}
  </section>;
}
