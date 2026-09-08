import { listProjects } from "@/lib/project-actions";
import { ProjectCard } from "@/app/_components/ProjectCard";

export const dynamic = "force-dynamic";

/**
 * Historial: el "hogar de lo terminado". Un proyecto tiene una vida
 * (activo → terminado/archivado) y acá viven los que ya no están en
 * curso — no escondidos detrás de un filtro.
 */
export default async function HistorialPage() {
  const [nonArchived, archived] = await Promise.all([
    listProjects(),
    listProjects({ archived: true }),
  ]);
  const finished = nonArchived.filter((p) => p.status === "FINISHED");

  const empty = finished.length === 0 && archived.length === 0;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Historial</h1>
      </div>

      {empty ? (
        <p className="empty-line">
          Todavía no hay proyectos terminados ni archivados. Cuando marques un
          proyecto como terminado o lo archives, aparece acá.
        </p>
      ) : null}

      {finished.length > 0 ? (
        <section className="history-section">
          <h2 className="section-title">
            Terminados <span className="muted">· {finished.length}</span>
          </h2>
          <div className="card-grid">
            {finished.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      ) : null}

      {archived.length > 0 ? (
        <section className="history-section">
          <h2 className="section-title">
            Archivados <span className="muted">· {archived.length}</span>
          </h2>
          <div className="card-grid">
            {archived.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
