import { WorkspaceMotif } from "@/components/workspace-motif";
import Link from "next/link";

import { ClientListControls } from "@/components/client-list-controls";
import { StatusChip } from "@/components/status-chip";
import { getClients, getClientCount, listStateFromSearchParams, listStateQuery } from "@/lib/clients";

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
  const [clients, total] = await Promise.all([getClients(state), getClientCount()]);
  const query = listStateQuery(state);
  const newHref = `/clients/new${query ? `?returnTo=${encodeURIComponent(`/clients?${query}`)}` : ""}`;
  const hasFilters = Boolean(state.query || state.statuses.length || state.sort !== "recent");

  return (
    <section className="clients-page directory-page" aria-labelledby="clients-title">
      <div className="page-heading clients-heading">
        <div>
          <p className="workspace-kicker">People at the heart of your teaching</p><h1 id="clients-title" className="editorial-title">Clients<span className="title-period">.</span></h1>
          <p>Your students, and the details that matter.</p>
        </div>
        {clients.length > 0 || hasFilters ? <Link className="button button-primary" href={newHref}><span aria-hidden="true">＋</span> Add Client</Link> : null}
      </div>

      {clients.length === 0 && !hasFilters ? (
        <section className="empty-state">
          <WorkspaceMotif kind="students" /><h2>Your teaching starts with a student.</h2>
          <p>Add your first student to keep their contact and school information in one place.</p>
          <Link className="button button-primary" href={newHref}><span aria-hidden="true">＋</span> Add Client</Link>
        </section>
      ) : (
        <>
          <ClientListControls state={state} />

          <div className="directory-label"><span>Student directory</span><span>{clients.length} {clients.length === 1 ? "student" : "students"}</span></div><div className="table-frame directory-table">
            <table>
              <thead>
                <tr>
                  <th aria-sort={state.sort === "alphabetical" ? "ascending" : state.sort === "name-desc" ? "descending" : "none"}><Link className="sortable-heading" href={`/clients?${listStateQuery({ ...state, sort: state.sort === "alphabetical" ? "name-desc" : "alphabetical" })}`} scroll={false}>Student Name <span aria-hidden="true">{state.sort === "alphabetical" ? "↑" : state.sort === "name-desc" ? "↓" : "↕"}</span></Link></th>
                  <th aria-sort={state.sort === "status-asc" ? "ascending" : state.sort === "status-desc" ? "descending" : "none"}><Link className="sortable-heading" href={`/clients?${listStateQuery({ ...state, sort: state.sort === "status-asc" ? "status-desc" : "status-asc" })}`} scroll={false}>Status <span aria-hidden="true">{state.sort === "status-asc" ? "↑" : state.sort === "status-desc" ? "↓" : "↕"}</span></Link></th>
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
                      <td><Link className="student-link" href={detailHref}><span className="student-initial" aria-hidden="true">{client.student_name.trim().split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("")}</span><span>{client.student_name}</span></Link></td>
                      <td><Link className="cell-link" href={detailHref}><StatusChip status={client.status} /></Link></td>
                      <td><Link className="cell-link" href={detailHref}>{client.payer_contact_name ?? "—"}</Link></td>
                      <td><Link className="cell-link" href={detailHref}>{client.phone_whatsapp ?? "—"}</Link></td>
                      <td><Link className="cell-link" href={detailHref}>{client.school ?? "—"}</Link></td>
                      <td><Link className="cell-link" href={detailHref}>{client.grade_year ?? "—"}</Link></td>
                      <td className="notes-cell"><Link href={detailHref}><span>{truncate(client.notes)}</span></Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {clients.length === 0 ? (
              <div className="no-results">
                <WorkspaceMotif kind="students" /><p>No students found here.</p>
                <Link className="clear-link" href="/clients">Clear search and filter</Link>
              </div>
            ) : null}
          </div>
        </>
      )}
      <p className="result-count">Showing {clients.length}{(state.query || state.statuses.length > 0) && clients.length < total ? ` of ${total}` : ""} clients</p>
    </section>
  );
}
