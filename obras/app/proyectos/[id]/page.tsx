import Link from "next/link";
import { notFound } from "next/navigation";
import {
  archiveProject,
  deleteProject,
  getProjectDetail,
  reviseProjectPrice,
  setProjectStatus,
  unarchiveProject,
} from "@/lib/project-actions";
import { listSegments } from "@/lib/segment-actions";
import {
  getQuickAddData,
  listProjectExpenses,
} from "@/lib/expense-actions";
import { PriceRevisionPanel } from "@/app/_components/PriceRevisionPanel";
import { SegmentManager } from "@/app/_components/SegmentManager";
import { StatusToggle } from "@/app/_components/StatusToggle";
import { ProjectDangerZone } from "@/app/_components/ProjectDangerZone";
import { QuickAddExpense } from "@/app/_components/QuickAddExpense";
import { ProjectExpensesList } from "@/app/_components/ProjectExpensesList";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, segments, expenses, quickAddData] = await Promise.all([
    getProjectDetail(id),
    listSegments(id),
    listProjectExpenses(id),
    getQuickAddData(),
  ]);
  if (!project) notFound();

  const revise = reviseProjectPrice.bind(null, id);
  const toggleStatus = setProjectStatus.bind(
    null,
    id,
    project.status === "FINISHED" ? "ACTIVE" : "FINISHED",
  );

  return (
    <>
      <p className="breadcrumb">
        <Link href="/proyectos">Proyectos</Link> / {project.name}
      </p>

      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <p className="muted" style={{ margin: "4px 0 0" }}>
            {project.clientName ?? "Sin cliente asignado"} ·{" "}
            <span
              className={`status-pill ${
                project.status === "FINISHED" ? "is-finished" : "is-active"
              }`}
            >
              {project.status === "FINISHED" ? "Terminado" : "Activo"}
            </span>
            {project.archived ? (
              <>
                {" "}
                <span className="status-pill is-finished">Archivado</span>
              </>
            ) : null}
          </p>
        </div>
        <div className="header-actions">
          <QuickAddExpense
            data={quickAddData}
            lockedProjectId={id}
            triggerLabel="+ Registrar gasto"
            triggerClassName="btn btn-primary"
          />
          <Link href={`/proyectos/${id}/editar`} className="btn">
            Editar datos
          </Link>
          <StatusToggle status={project.status} onToggle={toggleStatus} />
        </div>
      </div>

      <PriceRevisionPanel
        currentPrice={project.agreedTotalPrice}
        revisions={project.priceRevisions}
        action={revise}
      />

      <SegmentManager projectId={id} segments={segments} />

      <ProjectExpensesList projectId={id} expenses={expenses} />

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
