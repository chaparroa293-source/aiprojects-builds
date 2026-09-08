import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteProject,
  getProjectDetail,
  reviseProjectPrice,
  setProjectStatus,
} from "@/lib/project-actions";
import { listSegments } from "@/lib/segment-actions";
import { PriceRevisionPanel } from "@/app/_components/PriceRevisionPanel";
import { SegmentManager } from "@/app/_components/SegmentManager";
import { StatusToggle } from "@/app/_components/StatusToggle";
import { DeleteButton } from "@/app/_components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, segments] = await Promise.all([
    getProjectDetail(id),
    listSegments(id),
  ]);
  if (!project) notFound();

  const revise = reviseProjectPrice.bind(null, id);
  const toggleStatus = setProjectStatus.bind(
    null,
    id,
    project.status === "FINISHED" ? "ACTIVE" : "FINISHED",
  );
  const remove = deleteProject.bind(null, id);

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
          </p>
        </div>
        <div className="header-actions">
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

      <section className="panel danger-zone">
        <h2 className="panel-title">Eliminar proyecto</h2>
        <p className="muted" style={{ fontSize: 13 }}>
          Se eliminan también sus segmentos y el historial de precio. No se
          puede deshacer.
        </p>
        <DeleteButton
          action={remove}
          label="Eliminar proyecto"
          confirmMessage={`¿Eliminar el proyecto "${project.name}" y todo su contenido? Esta acción no se puede deshacer.`}
        />
      </section>
    </>
  );
}
