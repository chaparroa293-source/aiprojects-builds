import Link from "next/link";
import { notFound } from "next/navigation";
import { DIRECTORY, isDirectoryKind } from "@/lib/directory-config";
import {
  deleteRecord,
  getDirectoryDetail,
  updateRecord,
} from "@/lib/directory-actions";
import { DirectoryFormPopup } from "@/app/_components/DirectoryFormPopup";
import { ConfirmDeleteButton } from "@/app/_components/ConfirmPopup";
import { formatGsSymbol } from "@/lib/money";

export const dynamic = "force-dynamic";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default async function DirectoryDetailPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (!isDirectoryKind(kind)) notFound();

  const meta = DIRECTORY[kind];
  const detail = await getDirectoryDetail(kind, id);
  if (!detail) notFound();

  const { record, projects, expenses, totalSpend } = detail;
  const isSupplier = kind === "proveedores";

  // deleteRecord no devuelve estado; lo envolvemos para el popup de confirmación.
  async function confirmDelete() {
    "use server";
    await deleteRecord(kind as never, id);
    return { error: null };
  }

  return (
    <>
      <p className="breadcrumb">
        <Link href={`/${kind}`}>← {meta.listTitle}</Link>
      </p>

      <div className="page-header">
        <div>
          <h1 className="page-title">{record.name}</h1>
          <p className="muted subline">
            {record.activeProjectCount} proyecto
            {record.activeProjectCount === 1 ? "" : "s"} activo
            {record.activeProjectCount === 1 ? "" : "s"}
            {isSupplier && totalSpend !== null ? (
              <> · {formatGsSymbol(totalSpend)} gastado en total</>
            ) : null}
          </p>
        </div>
        <div className="header-actions">
          <DirectoryFormPopup
            action={updateRecord.bind(null, kind, id)}
            title={`Editar ${meta.singular}`}
            submitLabel="Guardar cambios"
            triggerLabel="Editar"
            triggerClassName="btn"
            record={record}
          />
          <ConfirmDeleteButton
            action={confirmDelete}
            triggerLabel="Eliminar"
            title={`Eliminar ${meta.singular}`}
            body={
              <>
                ¿Eliminar a “{record.name}”? Los gastos ya registrados no se
                borran: quedan sin proveedor asignado.
              </>
            }
            confirmLabel="Eliminar"
          />
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">Datos</h2>
        </div>
        <dl className="data-list">
          <div>
            <dt>Teléfono</dt>
            <dd className={record.phone ? "" : "muted"}>
              {record.phone ?? "—"}
            </dd>
          </div>
          <div>
            <dt>RUC</dt>
            <dd className={record.ruc ? "" : "muted"}>{record.ruc ?? "—"}</dd>
          </div>
        </dl>
      </section>

      {record.notes ? (
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Notas</h2>
          </div>
          <p className="notes-text">{record.notes}</p>
        </section>
      ) : null}

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">Proyectos vinculados</h2>
          <span className="muted">{projects.length}</span>
        </div>
        {projects.length === 0 ? (
          <p className="muted">
            {kind === "clientes"
              ? "Todavía no es cliente de ningún proyecto."
              : "Todavía no está vinculado a ningún proyecto. Se vincula desde la página de la obra."}
          </p>
        ) : (
          <table className="grid">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Estado</th>
                {isSupplier ? <th className="num">Gastado ahí</th> : null}
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="strong">
                    <Link href={`/proyectos/${p.id}`}>{p.name}</Link>
                  </td>
                  <td>
                    <span
                      className={`pill ${
                        p.status === "FINISHED" ? "is-finished" : "is-active"
                      }`}
                    >
                      {p.status === "FINISHED" ? "Terminado" : "Activo"}
                    </span>
                    {p.archived ? (
                      <span className="pill is-finished">Archivado</span>
                    ) : null}
                  </td>
                  {isSupplier ? (
                    <td className="num strong">
                      {formatGsSymbol(p.spend ?? 0)}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {isSupplier ? (
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Gastos con este proveedor</h2>
            <span className="muted">
              {expenses.length} · {formatGsSymbol(totalSpend ?? 0)}
            </span>
          </div>
          {expenses.length === 0 ? (
            <p className="muted">Todavía no hay gastos con este proveedor.</p>
          ) : (
            <table className="grid">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Proyecto · segmento</th>
                  <th className="num">Monto</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr key={e.id}>
                    <td className="muted nowrap">{fmtDate(e.spentAt)}</td>
                    <td>
                      <Link href={`/proyectos/${e.projectId}`}>
                        {e.projectName}
                      </Link>{" "}
                      <span className="seg-path">· {e.segmentLabel}</span>
                      {e.description ? (
                        <span className="muted"> · {e.description}</span>
                      ) : null}
                    </td>
                    <td className="num strong">{formatGsSymbol(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ) : null}
    </>
  );
}
