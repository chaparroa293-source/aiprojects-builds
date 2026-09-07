import { WorkspaceMotif } from "@/components/workspace-motif";
import Link from "next/link";
import { getMonthlyReview } from "@/lib/dashboard";
import { adjacentMonth, reviewMonth, reviewWeeks } from "@/lib/dashboard-shared";
import { classStatuses, formatDate, todayInProductTimezone } from "@/lib/schedule-shared";
import { formatGuarani } from "@/lib/payment-shared";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const today = todayInProductTimezone();
  const month = reviewMonth((await searchParams).month, today);
  const { classes, payments, clients } = await getMonthlyReview(month);
  const weeks = reviewWeeks(month, classes, payments);
  const maxClasses = Math.max(1, ...weeks.map((week) => week.classes));
  const maxReceived = weeks.reduce((max, week) => week.received > max ? week.received : max, BigInt(1));
  const received = weeks.reduce((total, week) => total + week.received, BigInt(0));
  const studentCount = clients.reduce((total, item) => total + item.count, 0);
  const monthLabel = formatDate(`${month}-01`, { month: "long", year: "numeric", day: undefined });
  const range = (start: string, end: string) => `${formatDate(start)}–${Number(end.slice(8))}`;

  return <section className="review-page" aria-labelledby="review-title">
    <header className="workspace-heading"><div><p className="workspace-kicker">A moment to reflect</p><h1 id="review-title" className="editorial-title">Dashboard<span className="title-period">.</span></h1><p>The shape of your teaching, in a few clear views.</p></div></header>
    <div className="review-period">
      <div><h2>{monthLabel}</h2><p>{month === today.slice(0, 7) ? "This month is still in progress." : "Recorded activity for the selected month."}</p></div>
      <nav className="month-navigation" aria-label="Review month">
        <Link className="button button-secondary month-arrow" href={`/dashboard?month=${adjacentMonth(month, -1)}`} aria-label="Previous month">←</Link>
        <Link className="button button-secondary" href="/dashboard">This month</Link>
        <Link className="button button-secondary month-arrow" href={`/dashboard?month=${adjacentMonth(month, 1)}`} aria-label="Next month">→</Link>
      </nav>
    </div>

    <div className="review-primary-grid">
      <section className="review-figure activity-figure" aria-labelledby="activity-title">
        <header><p className="workspace-kicker">01 / Your calendar</p><h2 id="activity-title">Class activity</h2><p><strong className="figure-total">{classes.length}</strong><span> classes on the calendar</span></p></header>
        {classes.length ? <ol className="activity-chart" aria-label="Classes by week">{weeks.map((week) => <li key={week.start}>
          <span className="activity-value">{week.classes}</span>
          <div className="activity-track" aria-hidden="true"><span className={week.start > today ? "activity-bar activity-future" : "activity-bar"} style={{ height: `${week.classes / maxClasses * 100}%` }} /></div>
          <span className="chart-date">{range(week.start, week.end)}</span><small>{week.start <= today && week.end >= today ? "In progress" : week.start > today ? "Upcoming" : "\u00a0"}</small>
        </li>)}</ol> : <div className="review-empty"><WorkspaceMotif kind="calendar" /><p>No classes recorded this month.</p><Link className="quiet-action" href="/schedule">Open Schedule ↗</Link></div>}
        <p className="figure-note">By class date · All statuses, including future Scheduled classes.</p>
      </section>

      <section className="review-figure received-figure" aria-labelledby="received-title">
        <header><p className="workspace-kicker">02 / Money received</p><h2 id="received-title">Payments received</h2><p><strong className="figure-total received-total">{formatGuarani(received)}</strong></p></header>
        {payments.length ? <ol className="received-chart" aria-label="Payments received by week">{weeks.map((week) => <li key={week.start}>
          <div><span>{range(week.start, week.end)}{week.start <= today && week.end >= today && <small> · In progress</small>}</span><strong>{formatGuarani(week.received)}</strong></div>
          <div className="received-track" aria-hidden="true"><span style={{ width: `${Number(week.received * BigInt(10000) / maxReceived) / 100}%` }} /></div>
        </li>)}</ol> : <div className="review-empty"><WorkspaceMotif kind="receipt" /><p>No payments recorded this month.</p><Link className="quiet-action" href="/payments">Open Payments ↗</Link></div>}
        <p className="figure-note">By payment date · Each received transaction counted once.</p>
      </section>
    </div>

    <div className="review-secondary-grid">
      <section className="review-distribution" aria-labelledby="outcomes-title"><header><p className="workspace-kicker">03 / How classes went</p><h2 id="outcomes-title">Class outcomes</h2><p className="section-caption">{monthLabel} · Current recorded statuses</p></header>
        {classes.length ? <ul className="distribution-list">{classStatuses.map((status) => {
          const count = classes.filter((item) => item.status === status).length;
          return <li key={status}><span><i className={`legend-dot outcome-${status.toLowerCase()}`} aria-hidden="true" />{status}</span><div className="distribution-track" aria-hidden="true"><span className={`outcome-${status.toLowerCase()}`} style={{ width: `${count / classes.length * 100}%` }} /></div><strong>{count}</strong></li>;
        })}</ul> : <p className="related-empty">Outcomes will appear when classes are recorded.</p>}
      </section>
      <section className="review-distribution" aria-labelledby="students-title"><header><p className="workspace-kicker">04 / Your students</p><h2 id="students-title">Students now <span className="snapshot-label">Current snapshot</span></h2><p className="section-caption">Today&apos;s client statuses, independent of the selected month.</p></header>
        {studentCount ? <><div className="student-spectrum" aria-hidden="true">{clients.map((item) => <span key={item.status} className={`student-${item.status.toLowerCase()}`} style={{ flexGrow: item.count }} />)}</div><ul className="student-legend">{clients.map((item) => <li key={item.status}><span><i className={`legend-dot student-${item.status.toLowerCase()}`} aria-hidden="true" />{item.status}</span><strong>{item.count}</strong></li>)}</ul></> : <p className="related-empty">No students yet. Your client statuses will appear here.</p>}
      </section>
    </div>
    <p className="review-footnote">Built from your class and payment records · America/Asuncion</p>
  </section>;
}
