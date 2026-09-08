import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DIRECTORY,
  isDirectoryKind,
  type DirectoryKind,
} from "@/lib/directory-config";
import {
  deleteRecord,
  getDirectoryDetail,
  updateRecord,
} from "@/lib/directory-actions";
import { DirectoryFormPopup } from "@/app/_components/DirectoryFormPopup";
import { ConfirmDeleteButton } from "@/app/_components/ConfirmPopup";
import { Gs } from "@/app/_components/Gs";
import { PhoneLink } from "@/app/_components/PhoneLink";

export const dynamic = "force-dynamic";

// Versalitas sobre el nombre. "integrante del personal" es demasiado
// largo para este renglón, así que cada directorio trae el suyo.
const KICKER: Record<DirectoryKind, string> = {
  clientes: "Cliente",
  proveedores: "Proveedor",
  personal: "Personal",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function plural(n: number, one: string, many: string) {
  return `${n} ${n === 1 ? one : many}`;
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

  // Sublínea de la cifra: qué hay detrás de ese número.
  const statLabel =
    expenses.length === 0
      ? "gastado en total · sin gastos registrados"
      : `gastado en total · ${plural(expenses.length, "gasto", "gastos")} en ${plural(projects.length, "proyecto", "proyectos")}`;

  return (
    <>
      <p className="breadcrumb">
        <Link href={`/${kind}`} className="btn btn-sm back-link">
          <span className="back-arrow" aria-hidden="true">
            ←
          </span>
          {meta.listTitle}
        </Link>
      </p>

      <div className="record-head">
        <div>
          <p className="record-kicker">{KICKER[kind]}</p>
          <h1 className="record-name">{record.name}</h1>
          {/* El rol va pegado al nombre, como un cargo bajo una persona
              — es identidad, no un dato suelto como el teléfono. */}
          {kind === "personal" && record.rol ? (
            <p className="record-role">{record.rol}</p>
          ) : null}
        </div>
        <div className="record-actions">
          <DirectoryFormPopup
            kind={kind}
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
            triggerClassName="btn btn-danger"
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

      {/* Cifra + datos sueltos en un panel, como cualquier sección del
          resto de la app. Sin encabezado propio: el nombre de arriba ya
          dice de quién son estos datos. */}
      <section className="panel">
        {isSupplier ? (
          <div className="record-stat">
            <div className="record-stat-value">
              <Gs value={totalSpend ?? 0} />
            </div>
            <p className="record-stat-label">{statLabel}</p>
          </div>
        ) : null}

        <dl className="record-facts">
          {isSupplier ? null : (
            <div>
              <dt>Proyectos activos</dt>
              <dd>{record.activeProjectCount}</dd>
            </div>
          )}
          <div>
            <dt>Teléfono</dt>
            <dd className={record.phone ? "" : "is-empty"}>
              {record.phone ? (
                <PhoneLink phone={record.phone} />
              ) : (
                "Sin registrar"
              )}
            </dd>
          </div>
          <div>
            <dt>RUC</dt>
            <dd className={record.ruc ? "" : "is-empty"}>
              {record.ruc ?? "Sin registrar"}
            </dd>
          </div>
          {record.notes ? (
            <div>
              <dt>Notas</dt>
              <dd>
                <p className="record-notes">{record.notes}</p>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2 className="panel-title">Proyectos vinculados</h2>
          <span className="muted">{projects.length}</span>
        </div>
        {projects.length === 0 ? (
          <p className="muted">
            {kind === "clientes"
              ? "Ninguno todavía."
              : "Ninguno. Se vinculan desde la página de la obra."}
          </p>
        ) : isSupplier ? (
          // Es contexto histórico, no algo que el proveedor "usa" día a
          // día — una fila de etiquetas pesa menos que una tabla con su
          // propio encabezado. El detalle de gasto por obra ya está en
          // la ficha del proyecto; acá alcanza con la referencia.
          <ul className="tag-list">
            {projects.map((p) => {
              const past = p.status === "FINISHED" || p.archived;
              return (
                <li key={p.id}>
                  <Link
                    href={`/proyectos/${p.id}`}
                    className={`tag-chip ${past ? "is-past" : ""}`}
                    title={
                      p.archived
                        ? "Archivado"
                        : p.status === "FINISHED"
                          ? "Terminado"
                          : "Activo"
                    }
                  >
                    {p.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <table className="grid">
            <thead>
              <tr>
                <th>Proyecto</th>
                <th>Estado</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {isSupplier ? (
        <section className="panel">
          <div className="panel-head">
            <h2 className="panel-title">Gastos</h2>
            <span className="muted">
              {expenses.length} gasto{expenses.length === 1 ? "" : "s"} ·{" "}
              <Gs value={totalSpend ?? 0} />
            </span>
          </div>
          {expenses.length === 0 ? (
            <p className="muted">Ninguno todavía.</p>
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
                    <td className="num strong">
                        <Gs value={e.amount} />
                      </td>
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
