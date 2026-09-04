import Link from "next/link";

import { ClientListControls } from "@/components/client-list-controls";
import { StatusChip } from "@/components/status-chip";
import { getClients, listStateFromSearchParams, listStateQuery } from "@/lib/clients";

export const dynamic = "force-dynamic";

function truncate(value: string | null) {
  if (!value) return "—";
  return value.length > 40 ? `${value.slice(0, 40)}…` : value;
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = listStateFromSearchParams(await searchParams);
  const clients = await getClients(state);
  const query = listStateQuery(state);
  const newHref = `/clients/new${query ? `?returnTo=${encodeURIComponent(`/clients?${query}`)}` : ""}`;
  const hasFilters = Boolean(state.query || state.status !== "All");

  return (
    <section className="clients-page" aria-labelledby="clients-title">
      <div className="page-heading clients-heading">
        <div>
          <h1 id="clients-title">Clients</h1>
          <p>Manage your students and their information.</p>
        </div>
        {clients.length > 0 || hasFilters ? <Link className="button button-primary" href={newHref}><span aria-hidden="true">＋</span> Add Client</Link> : null}
      </div>

      {clients.length === 0 && !hasFilters ? (
        <section className="empty-state">
          <h2>No clients yet</h2>
          <p>Add your first student to keep their contact and school information in one place.</p>
          <Link className="button button-primary" href={newHref}><span aria-hidden="true">＋</span> Add Client</Link>
        </section>
      ) : (
        <>
          <ClientListControls key={query} state={state} />

          <div className="table-frame">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Payer / Contact</th>
                  <th>Phone</th>
                  <th>School</th>
                  <th>Grade</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const detailHref = `/clients/${client.id}${query ? `?${query}` : ""}`;
                  return (
                    <tr key={client.id}>
                      <td><Link className="student-link" href={detailHref}>{client.student_name}</Link></td>
                      <td><Link className="cell-link" href={detailHref}><StatusChip status={client.status} /></Link></td>
                      <td><Link className="cell-link" href={detailHref}>{client.payer_contact_name ?? "—"}</Link></td>
                      <td><Link className="cell-link" href={detailHref}>{client.phone_whatsapp ?? "—"}</Link></td>
                      <td><Link className="cell-link" href={detailHref}>{client.school ?? "—"}</Link></td>
                      <td><Link className="cell-link" href={detailHref}>{client.grade_year ?? "—"}</Link></td>
                      <td className="notes-cell"><Link href={detailHref}><span>{truncate(client.notes)}</span><span className="row-arrow" aria-hidden="true">›</span></Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {clients.length === 0 ? (
              <div className="no-results">
                <p>No clients match</p>
                <Link className="clear-link" href="/clients">Clear search and filter</Link>
              </div>
            ) : null}
          </div>
          {clients.length > 0 ? <p className="result-count">{clients.length} {clients.length === 1 ? "client" : "clients"}</p> : null}
        </>
      )}
    </section>
  );
}
