import Link from "next/link";
import { countArchivedProjects, listProjects } from "@/lib/project-actions";
import { formatGsSymbol } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage({
  searchParams,
}: {
  searchParams: Promise<{ archivados?: string }>;
}) {
  const { archivados } = await searchParams;
  const showArchived = archivados === "1";
  const [projects, archivedCount] = await Promise.all([
    listProjects({ archived: showArchived }),
    countArchivedProjects(),
  ]);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">
          {showArchived ? "Proyectos archivados" : "Proyectos"}
        </h1>
        {showArchived ? (
          <Link href="/proyectos" className="btn">
            ← Volver a activos
          </Link>
        ) : (
          <Link href="/proyectos/nuevo" className="btn btn-primary">
            + Nuevo proyecto
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <p className="empty-state">
            {showArchived
              ? "No hay proyectos archivados."
              : "Todavía no hay proyectos cargados."}
          </p>
        </div>
      ) : (
        <div className="card">
          <table className="directory">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Precio acordado</th>
                <th>Segmentos</th>
                <th>Gastos</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="row-name">
                    <Link href={`/proyectos/${p.id}`}>{p.name}</Link>
                  </td>
                  <td className={p.clientName ? "" : "muted"}>
                    {p.clientName ?? "— sin cliente —"}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        p.status === "FINISHED" ? "is-finished" : "is-active"
                      }`}
                    >
                      {p.status === "FINISHED" ? "Terminado" : "Activo"}
                    </span>
                  </td>
                  <td>{formatGsSymbol(p.agreedTotalPrice)}</td>
                  <td className="muted">{p.segmentCount}</td>
                  <td className="muted">{p.expenseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showArchived && archivedCount > 0 ? (
        <p style={{ marginTop: 16 }}>
          <Link href="/proyectos?archivados=1" className="link-btn">
            Ver {archivedCount} proyecto{archivedCount === 1 ? "" : "s"}{" "}
            archivado{archivedCount === 1 ? "" : "s"}
          </Link>
        </p>
      ) : null}
    </>
  );
}
