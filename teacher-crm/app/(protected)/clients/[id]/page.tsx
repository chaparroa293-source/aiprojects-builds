import Link from "next/link";
import { notFound } from "next/navigation";

import { updateClientStatus } from "@/app/(protected)/clients/actions";
import { StatusChip } from "@/components/status-chip";
import { statuses } from "@/lib/client-status";
import { getClient, listStateFromSearchParams, listStateQuery } from "@/lib/clients";

export const dynamic = "force-dynamic";

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return <div className="detail-item"><dt>{label}</dt><dd>{value || "—"}</dd></div>;
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
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <section className="detail-page" aria-labelledby="client-name">
      <div className="detail-topline">
        <Link className="back-link" href={returnTo}>← Back to clients</Link>
        <Link className="button button-secondary" href={`/clients/${id}/edit?returnTo=${encodeURIComponent(returnTo)}`}>Edit client</Link>
      </div>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">Client</p>
          <h1 id="client-name">{client.student_name}</h1>
        </div>
        <div className="inline-status">
          <StatusChip status={client.status} />
          <form action={updateClientStatus.bind(null, id)}>
            <input type="hidden" name="returnTo" value={`/clients/${id}${query ? `?${query}` : ""}`} />
            <label className="visually-hidden" htmlFor="client-status">Status</label>
            <select id="client-status" name="status" defaultValue={client.status}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <button className="text-button" type="submit">Update</button>
          </form>
        </div>
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
            <DetailItem label="Phone / WhatsApp" value={client.phone_whatsapp} />
          </dl>
        </section>
        <section className="detail-card detail-notes">
          <h2>Notes</h2>
          <p>{client.notes || "No notes yet."}</p>
        </section>
      </div>
    </section>
  );
}
