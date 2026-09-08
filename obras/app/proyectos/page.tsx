import Link from "next/link";
import { listProjects } from "@/lib/project-actions";
import { formatGsSymbol } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage() {
  const projects = await listProjects();

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Proyectos</h1>
        <Link href="/proyectos/nuevo" className="btn btn-primary">
          + Nuevo proyecto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card">
          <p className="empty-state">Todavía no hay proyectos cargados.</p>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
