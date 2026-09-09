import Link from "next/link";
import { notFound } from "next/navigation";
import {
  archiveProject,
  deleteProject,
  getProjectDetail,
  listClientOptions,
  reviseProjectPrice,
  setProjectStatus,
  unarchiveProject,
  updateProjectDetails,
} from "@/lib/project-actions";
import { listSegments } from "@/lib/segment-actions";
import { listProjectExpenses } from "@/lib/expense-actions";
import { getProjectTeam } from "@/lib/link-actions";
import { SpendSummary } from "@/app/_components/SpendSummary";
import { SegmentManager } from "@/app/_components/SegmentManager";
import { ExpenseList } from "@/app/_components/ExpenseList";
import { ProjectTeamPanel } from "@/app/_components/ProjectTeamPanel";
import { ProjectDangerZone } from "@/app/_components/ProjectDangerZone";
import { ProjectFormPopup } from "@/app/_components/ProjectFormPopup";
import { QuickAddExpense } from "@/app/_components/QuickAddExpense";
import { StatusToggle } from "@/app/_components/StatusToggle";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, segments, expenses, team, clients] = await Promise.all([
    getProjectDetail(id),
    listSegments(id),
    listProjectExpenses(id),
    getProjectTeam(id),
    listClientOptions(),
  ]);
  if (!project) notFound();

  const toggleStatus = setProjectStatus.bind(
    null,
    id,
    project.status === "FINISHED" ? "ACTIVE" : "FINISHED",
  );

  return (
    <>
      <p className="breadcrumb">
        <Link href="/proyectos" className="btn btn-sm back-link">
          <span className="back-arrow" aria-hidden="true">
            ←
          </span>
          Proyectos
        </Link>
      </p>

      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <p className="muted subline">
            {project.clientName ?? "Sin cliente asignado"}{" "}
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
            {project.createdByName ? (
              <span className="creator-note">
                Creado por {project.createdByName}
              </span>
            ) : null}
          </p>
        </div>
        <div className="header-actions">
          {/* Botón persistente de carga dentro del proyecto (además del
              global de la barra lateral). */}
          <QuickAddExpense
            lockedProjectId={id}
            triggerLabel="+ Registrar gasto"
            triggerClassName="btn btn-primary"
          />
          <ProjectFormPopup
            action={updateProjectDetails.bind(null, id)}
            clients={clients}
            mode="edit"
            triggerLabel="Editar"
            triggerClassName="btn"
            defaults={{
              name: project.name,
              clientId: project.clientId,
              agreedTotalPrice: project.agreedTotalPrice,
              status: project.status,
            }}
          />
          <StatusToggle status={project.status} onToggle={toggleStatus} />
        </div>
      </div>

      {/* 1. Lo primero: gastado vs. acordado. */}
      <SpendSummary
        agreedTotalPrice={project.agreedTotalPrice}
        spend={project.expenseTotal}
        revisions={project.priceRevisions}
        reviseAction={reviseProjectPrice.bind(null, id)}
      />

      {/* 2. El árbol de segmentos. */}
      <SegmentManager projectId={id} segments={segments} />

      {/* 3. Actividad reciente. */}
      <ExpenseList
        expenses={expenses}
        title="Actividad reciente"
        limit={8}
        emptyText="Todavía no hay gastos. Usá “+ Registrar gasto” arriba."
      />

      <ProjectTeamPanel projectId={id} team={team} />

      <ProjectDangerZone
        projectName={project.name}
        archived={project.archived}
        expenseCount={project.expenseCount}
        deleteAction={deleteProject.bind(null, id)}
        archiveAction={archiveProject.bind(null, id)}
        unarchiveAction={unarchiveProject.bind(null, id)}
      />
    </>
  );
}
