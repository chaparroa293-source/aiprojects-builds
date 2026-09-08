import Link from "next/link";
import type { ProjectListItem } from "@/lib/project-actions";
import { formatGsSymbol } from "@/lib/money";

/**
 * Tarjeta de proyecto para la grilla de /proyectos y /historial.
 * El detalle visual fino es de una pasada posterior; por ahora es el
 * cambio de tabla a grilla de tarjetas.
 */
export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link href={`/proyectos/${project.id}`} className="project-card">
      <div className="project-card-top">
        <span className="project-card-name">{project.name}</span>
        <span className="project-card-pills">
          <span
            className={`pill ${
              project.status === "FINISHED" ? "is-finished" : "is-active"
            }`}
          >
            {project.status === "FINISHED" ? "Terminado" : "Activo"}
          </span>
          {project.archived ? (
            <span className="pill is-finished">Archivado</span>
          ) : null}
        </span>
      </div>

      <span className={`project-card-client ${project.clientName ? "" : "muted"}`}>
        {project.clientName ?? "Sin cliente"}
      </span>

      <div className="project-card-figure">
        {formatGsSymbol(project.agreedTotalPrice)}
        <span className="project-card-figure-label">precio acordado</span>
      </div>

      <div className="project-card-meta">
        {project.segmentCount} segmento{project.segmentCount === 1 ? "" : "s"}
        {" · "}
        {project.expenseCount} gasto{project.expenseCount === 1 ? "" : "s"}
      </div>
    </Link>
  );
}
