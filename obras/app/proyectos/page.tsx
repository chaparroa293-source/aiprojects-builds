import Link from "next/link";
import {
  countArchivedProjects,
  createProject,
  listClientOptions,
  listProjects,
} from "@/lib/project-actions";
import { formatGsSymbol } from "@/lib/money";
import { ProjectFormPopup } from "@/app/_components/ProjectFormPopup";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage({
  searchParams,
}: {
  searchParams: Promise<{ archivados?: string }>;
}) {
  const { archivados } = await searchParams;
  const showArchived = archivados === "1";
  const [projects, archivedCount, clients] = await Promise.all([
    listProjects({ archived: showArchived }),
    countArchivedProjects(),
    listClientOptions(),
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
          <ProjectFormPopup
            action={createProject}
            clients={clients}
            mode="create"
            triggerLabel="+ Nuevo proyecto"
          />
        )}
      </div>

      {projects.length === 0 ? (
        <div className="panel">
          <p className="empty-state">
            {showArchived
              ? "No hay proyectos archivados."
              : "Todavía no hay proyectos cargados."}
          </p>
        </div>
      ) : (
        <div className="panel panel-flush">
          <table className="grid">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th className="num">Precio acordado</th>
                <th className="num">Segmentos</th>
                <th className="num">Gastos</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td className="strong">
                    <Link href={`/proyectos/${p.id}`}>{p.name}</Link>
                  </td>
                  <td className={p.clientName ? "" : "muted"}>
                    {p.clientName ?? "— sin cliente —"}
                  </td>
                  <td>
                    <span
                      className={`pill ${
                        p.status === "FINISHED" ? "is-finished" : "is-active"
                      }`}
                    >
                      {p.status === "FINISHED" ? "Terminado" : "Activo"}
                    </span>
                  </td>
                  <td className="num">{formatGsSymbol(p.agreedTotalPrice)}</td>
                  <td className="num muted">{p.segmentCount}</td>
                  <td className="num muted">{p.expenseCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!showArchived && archivedCount > 0 ? (
        <p style={{ marginTop: 14 }}>
          <Link href="/proyectos?archivados=1" className="link-btn">
            Ver {archivedCount} proyecto{archivedCount === 1 ? "" : "s"}{" "}
            archivado{archivedCount === 1 ? "" : "s"}
          </Link>
        </p>
      ) : null}
    </>
  );
}
