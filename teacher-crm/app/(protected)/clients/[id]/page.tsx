import Link from "next/link";
import { notFound } from "next/navigation";

import ClientsPage from "@/app/(protected)/clients/page";
import { ClientDetailPanel } from "@/components/client-detail-panel";
import { ClientStatusControl } from "@/components/client-status-control";
import { removeRegularScheduleSlot } from "@/app/(protected)/schedule/actions";
import { ClassStatusChip } from "@/components/class-status-chip";
import { getClient, listStateFromSearchParams, listStateQuery } from "@/lib/clients";
import { getClientSchedule } from "@/lib/schedule";
import { endTime, formatDate, formatTime, nowInProductTimezone, weekdayLabel, type TutoringClass } from "@/lib/schedule-shared";

export const dynamic = "force-dynamic";

function whatsappHref(value: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("595") && digits.length >= 11 && digits.length <= 15) return `https://wa.me/${digits}`;
  if (digits.startsWith("0") && digits.length === 10) return `https://wa.me/595${digits.slice(1)}`;
  if (digits.startsWith("9") && digits.length === 9) return `https://wa.me/595${digits}`;
  return digits.length >= 8 && digits.length <= 15 ? `https://wa.me/${digits}` : null;
}

function DetailItem({ label, value, whatsapp = false }: { label: string; value: string | null; whatsapp?: boolean }) {
  const href = whatsapp ? whatsappHref(value) : null;
  return <div className="detail-item"><dt>{label}</dt><dd>{value ? <>{value}{href && <a className="whatsapp-link" href={href} target="_blank" rel="noreferrer">WhatsApp ↗</a>}</> : "—"}</dd></div>;
}

function ClassRows({ classes, returnTo }: { classes: TutoringClass[]; returnTo: string }) {
  return <div className="client-class-rows">{classes.map((item) => <Link className="client-class-row" href={`/schedule/classes/${item.id}/edit?returnTo=${encodeURIComponent(returnTo)}`} key={item.id}>
    <span>{item.class_topic && <strong className="class-topic">{item.class_topic}</strong>}<strong>{formatDate(item.class_date, { weekday: "short", month: "short", day: "numeric" })}</strong><small>{formatTime(item.start_time)}–{endTime(item.start_time, item.duration_minutes)} · {item.duration_minutes} min</small></span>
    <ClassStatusChip status={item.status} />
    <span className="class-row-notes">{item.notes || ""}</span>
    <span className="row-arrow" aria-hidden="true">›</span>
  </Link>)}</div>;
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const state = listStateFromSearchParams(await searchParams);
  const query = listStateQuery(state);
  const returnTo = `/clients${query ? `?${query}` : ""}`;
  const [client, schedule] = await Promise.all([getClient(id), getClientSchedule(id)]);
  if (!client) notFound();
  const now = nowInProductTimezone();
  const upcoming = schedule.classes.filter((item) => `${item.class_date}T${formatTime(item.start_time)}` >= now);
  const past = schedule.classes.filter((item) => `${item.class_date}T${formatTime(item.start_time)}` < now).reverse();
  const detailReturnTo = `/clients/${id}${query ? `?${query}` : ""}`;

  return (
    <>
    <ClientsPage searchParams={searchParams} />
    <ClientDetailPanel returnTo={returnTo}>
    <section className="detail-page" aria-labelledby="client-name">
      <div className="detail-topline">
        <Link className="panel-close" href={returnTo} aria-label="Close client detail" title="Close client detail">›</Link>
        <Link className="button button-secondary" href={`/clients/${id}/edit?returnTo=${encodeURIComponent(detailReturnTo)}`}>Edit client</Link>
      </div>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">Client</p>
          <h1 id="client-name">{client.student_name}</h1>
        </div>
        <ClientStatusControl id={id} status={client.status} returnTo={detailReturnTo} />
      </div>

      <div className="detail-grid">
        <section className="detail-card">
          <h2>Student information</h2>
          <dl>
            <DetailItem label="School" value={client.school} />
            <DetailItem label="Grade / Year" value={client.grade_year} />
          </dl>
        </section>
        <section className="detail-card">
          <h2>Contact information</h2>
          <dl>
            <DetailItem label="Payer / Contact Name" value={client.payer_contact_name} />
            <DetailItem label="Relationship to Student" value={client.relationship_to_student} />
            <DetailItem label="Phone / WhatsApp" value={client.phone_whatsapp} whatsapp />
          </dl>
        </section>
        <section className="detail-card detail-notes">
          <h2>Notes</h2>
          <p>{client.notes || "No notes yet."}</p>
        </section>
      </div>

      <section className="related-section" aria-labelledby="client-classes-title">
        <div className="section-heading"><div><h2 id="client-classes-title">Classes</h2><p>Upcoming classes and history for this student.</p></div><Link className="button button-secondary" href={`/schedule/classes/new?client=${id}&returnTo=${encodeURIComponent(detailReturnTo)}`}>+ Add Class</Link></div>
        {!schedule.classes.length ? <div className="related-empty"><p>No classes yet.</p><Link className="text-button" href={`/schedule/classes/new?client=${id}&returnTo=${encodeURIComponent(detailReturnTo)}`}>Add Class</Link></div> : <>
          {upcoming.length > 0 && <div className="class-group"><h3>Upcoming</h3><ClassRows classes={upcoming} returnTo={detailReturnTo} /></div>}
          {past.length > 0 && <div className="class-group"><h3>Past</h3><ClassRows classes={past} returnTo={detailReturnTo} /></div>}
        </>}
      </section>

      <section className="related-section" aria-labelledby="regular-schedule-title">
        <div className="section-heading"><div><h2 id="regular-schedule-title">Regular schedule</h2><p>Quick defaults for this student&apos;s normal class times.</p></div><Link className="button button-secondary" href={`/clients/${id}/regular-schedule/new?returnTo=${encodeURIComponent(detailReturnTo)}`}>+ Add regular time</Link></div>
        {!schedule.slots.length ? <div className="related-empty"><p>No regular schedule.</p><Link className="text-button" href={`/clients/${id}/regular-schedule/new?returnTo=${encodeURIComponent(detailReturnTo)}`}>Add regular time</Link></div> : <div className="regular-slot-rows">{schedule.slots.map((slot) => <div className="regular-slot-row" key={slot.id}>
          <span><strong>{weekdayLabel(slot.weekday)}</strong><small>{formatTime(slot.start_time)}–{endTime(slot.start_time, slot.duration_minutes)} · {slot.duration_minutes} min</small></span>
          <div className="row-actions"><Link className="text-button" href={`/clients/${id}/regular-schedule/${slot.id}/edit?returnTo=${encodeURIComponent(detailReturnTo)}`}>Edit</Link><form action={removeRegularScheduleSlot.bind(null, slot.id)}><input type="hidden" name="returnTo" value={detailReturnTo} /><button className="text-button danger-link" type="submit">Remove</button></form></div>
        </div>)}</div>}
      </section>
    </section>
    </ClientDetailPanel>
    </>
  );
}
