import Link from "next/link";
import type { ProjectListItem } from "@/lib/project-actions";
import { formatSpendPct, spendBarWidth } from "@/lib/money";
import { Gs } from "./Gs";

/**
 * Tarjeta de proyecto para /proyectos y /historial.
 *
 * Jerarquía: el nombre identifica; cliente + estado son contexto; los
 * números financieros (gastado a la fecha, % consumido, margen contra
 * el precio acordado) son lo más prominente; segmentos/gastos quedan
 * como metadata secundaria bajo una línea divisoria.
 *
 * Comparación estática, sin ritmo ni proyección (spec, sección 2).
 */
export function ProjectCard({ project }: { project: ProjectListItem }) {
  const spent = project.expenseTotal;
  const agreed = project.agreedTotalPrice;
  const diff = agreed - spent; // > 0 margen; < 0 excedido
  const over = diff < 0;
  const pctLabel = formatSpendPct(spent, agreed);
  const barWidth = spendBarWidth(spent, agreed);

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

      <span
        className={`project-card-client ${project.clientName ? "" : "muted"}`}
      >
        {project.clientName ?? "Sin cliente"}
      </span>

      <div className="project-card-money">
        <div className="project-card-spent-row">
          <span className={`project-card-spent ${over ? "is-over" : ""}`}>
            <Gs value={spent} />
          </span>
          <span className={`project-card-pct ${over ? "is-over" : ""}`}>
            {pctLabel}
          </span>
        </div>
        <span className="project-card-figure-label">gastado a la fecha</span>

        <div className="project-card-bar" aria-hidden="true">
          <div
            className={`project-card-bar-fill ${over ? "is-over" : ""}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        <div className="project-card-underbar">
          <span>
            de <Gs value={agreed} />
          </span>
          <span
            className={`project-card-margin ${over ? "is-over" : "is-ok"}`}
          >
            {over ? "excedido " : "margen "}
            <Gs value={Math.abs(diff)} />
          </span>
        </div>
      </div>

      <div className="project-card-meta">
        {project.segmentCount} segmento{project.segmentCount === 1 ? "" : "s"}
        {" · "}
        {project.expenseCount} gasto{project.expenseCount === 1 ? "" : "s"}
      </div>
    </Link>
  );
}
