import { WorkspaceMotif } from "@/components/workspace-motif";
import Link from "next/link";
import { ClassStatusChip } from "@/components/class-status-chip";
import { ClassPaymentStatusChip } from "@/components/class-payment-status-chip";
import { getHomeClasses } from "@/lib/schedule";
import { getRecentPayments } from "@/lib/payments";
import { formatGuarani } from "@/lib/payment-shared";
import { endTime, formatDate, formatTime, isClassOutcomeUnresolved, isClassPaymentStatusRelevant, nowInProductTimezone, type TutoringClass } from "@/lib/schedule-shared";

export const dynamic = "force-dynamic";

function classHref(id: string) {
  return `/schedule/classes/${id}/edit?returnTo=%2Fhome`;
}

function AttentionList({ classes, kind }: { classes: TutoringClass[]; kind: "outcome" | "payment" }) {
  if (!classes.length) return <p className="attention-clear"><WorkspaceMotif kind="complete" />{kind === "outcome" ? "All caught up. No outcomes to record." : "No past classes without a linked payment."}</p>;
  return <ul className="attention-list">{classes.map((item) => <li key={item.id}>
    <div><Link className="person-link" href={`/clients/${item.client_id}?returnTo=%2Fhome`}>{item.client.student_name}</Link><span className="attention-date">{formatDate(item.class_date, { month: "short", day: "numeric", year: "numeric" })} · {formatTime(item.start_time)}</span></div>
    <Link className="quiet-action" href={classHref(item.id)} aria-label={`Open ${item.client.student_name} class from ${item.class_date}`}>Open class<span aria-hidden="true">↗</span></Link>
  </li>)}</ul>;
}

export default async function HomePage() {
  const now = nowInProductTimezone();
  const today = now.slice(0, 10);
  const [{ todayClasses, attentionCandidates }, payments] = await Promise.all([getHomeClasses(today), getRecentPayments()]);
  const outcomes = attentionCandidates.filter((item) => isClassOutcomeUnresolved(item, now));
  const unlinked = attentionCandidates.filter((item) => !item.payment_id && isClassPaymentStatusRelevant(item, now));
  const nextClass = todayClasses.find((item) => item.status === "Scheduled" && `${item.class_date}T${formatTime(item.start_time)}` >= now);

  return <section className="home-page" aria-labelledby="home-title">
    <header className="workspace-heading">
      <div><p className="workspace-kicker">Your teaching workspace</p><h1 id="home-title" className="editorial-title">Home<span className="title-period">.</span></h1><p>A little clarity for the day ahead.</p></div>
      <div className="workspace-actions"><Link className="button button-secondary" href="/payments/new?returnTo=%2Fhome">Record Payment</Link><Link className="button button-primary" href={`/schedule/classes/new?date=${today}&returnTo=%2Fhome`}><span aria-hidden="true">＋</span> Add Class</Link></div>
    </header>

    <div className="home-main-grid">
      <section className="day-sheet" aria-labelledby="day-title">
        <header className="day-sheet-heading"><div className="date-stamp"><span>{formatDate(today, { month: "short", day: undefined })}</span><strong>{Number(today.slice(8))}</strong></div><div><p className="workspace-kicker">{formatDate(today, { weekday: "long", month: undefined, day: undefined })}</p><h2 id="day-title">Your day</h2><p>{todayClasses.length ? `${todayClasses.length} ${todayClasses.length === 1 ? "class" : "classes"} on the calendar` : "Room to breathe"}</p></div><Link className="quiet-action" href="/schedule">View week<span aria-hidden="true">↗</span></Link></header>
        {todayClasses.length ? <ol className="day-timeline">{todayClasses.map((item) => {
          const start = new Date(`${item.class_date}T${item.start_time.slice(0, 5)}:00Z`).getTime();
          const clock = new Date(`${now}:00Z`).getTime();
          const slotNow = clock >= start && clock < start + item.duration_minutes * 60000;
          const past = clock >= start + item.duration_minutes * 60000;
          return <li className={`day-entry${nextClass?.id === item.id ? " day-entry-next" : ""}${slotNow ? " day-entry-now" : ""}${past ? " day-entry-past" : ""}`} key={item.id}>
          <div className="day-time"><time>{formatTime(item.start_time)}</time><span>{endTime(item.start_time, item.duration_minutes)}</span></div>
          <div className="day-entry-body">
            {slotNow && <span className="time-slot-now">Scheduled time · Now</span>}{!slotNow && nextClass?.id === item.id && <span className="up-next"><span aria-hidden="true" />Up next</span>}
            <div className="day-entry-heading"><Link className="person-link" href={`/clients/${item.client_id}?returnTo=%2Fhome`}>{item.client.student_name}</Link><Link className="quiet-action" href={classHref(item.id)} aria-label={`Open ${item.client.student_name} class`}>Open class<span aria-hidden="true">↗</span></Link></div>
            <p className="day-topic">{item.class_topic || "Tutoring class"}<span> · {item.duration_minutes} min</span></p>
            <div className="day-statuses"><ClassStatusChip status={item.status} />{isClassPaymentStatusRelevant(item, now) && <ClassPaymentStatusChip paymentId={item.payment_id} href={item.payment_id ? `/payments/${item.payment_id}/edit?returnTo=%2Fhome` : undefined} />}</div>
          </div>
        </li>; })}</ol> : <div className="day-empty"><WorkspaceMotif kind="calendar" /><h3>A clear day.</h3><p>No classes scheduled for today.</p><Link className="quiet-action" href="/schedule">Take a look at your week<span aria-hidden="true">↗</span></Link></div>}
        <footer className="day-sheet-footer"><span className="small-dot" aria-hidden="true" />America/Asuncion · Your local teaching day</footer>
      </section>

      <aside className="home-attention" aria-labelledby="attention-title"><div className="attention-heading"><p className="workspace-kicker">A little follow-through</p><h2 id="attention-title">Needs attention</h2></div>
        <section className="attention-group" aria-labelledby="outcome-title"><h3 id="outcome-title"><span className="attention-mark outcome-mark" aria-hidden="true">✓</span>Outcomes to record<span className="inline-count">{outcomes.length}</span></h3><p className="section-caption">Past classes still marked Scheduled.</p><AttentionList classes={outcomes} kind="outcome" /></section>
        <section className="attention-group" aria-labelledby="unlinked-title"><h3 id="unlinked-title"><span className="attention-mark payment-mark" aria-hidden="true">↔</span>No payment linked<span className="inline-count">{unlinked.length}</span></h3><p className="section-caption">Past classes without a payment attached.</p><AttentionList classes={unlinked} kind="payment" /></section>
      </aside>
    </div>

    <section className="home-payments" aria-labelledby="home-payments-title"><header className="section-heading"><div><p className="workspace-kicker">Recently recorded</p><h2 id="home-payments-title">Payments received</h2></div><Link className="quiet-action" href="/payments">View all payments<span aria-hidden="true">↗</span></Link></header>
      {payments.length ? <ul className="home-payment-list">{payments.map((payment) => <li key={payment.id}><span className="payment-receipt-icon" aria-hidden="true">↙</span><Link className="person-link" href={`/clients/${payment.client_id}?returnTo=%2Fhome`}>{payment.client.student_name}</Link><time dateTime={payment.payment_date}>{formatDate(payment.payment_date, { year: "numeric" })}</time><Link className="payment-amount" href={`/payments/${payment.id}/edit?returnTo=%2Fhome`} aria-label={`Open payment of ${formatGuarani(payment.amount)} from ${payment.client.student_name}`}>{formatGuarani(payment.amount)}</Link></li>)}</ul> : <p className="related-empty">Your received payments will appear here. <Link className="quiet-action" href="/payments/new?returnTo=%2Fhome">Record a payment</Link></p>}
    </section>
  </section>;
}
