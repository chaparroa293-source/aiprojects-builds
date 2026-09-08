import {
  createProject,
  listClientOptions,
  listProjects,
} from "@/lib/project-actions";
import { ProjectFormPopup } from "@/app/_components/ProjectFormPopup";
import { ProjectCard } from "@/app/_components/ProjectCard";

export const dynamic = "force-dynamic";

export default async function ProjectsListPage() {
  const [all, clients] = await Promise.all([
    listProjects(),
    listClientOptions(),
  ]);
  // Proyectos = solo los activos. Los terminados viven en Historial.
  const projects = all.filter((p) => p.status === "ACTIVE");

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Proyectos</h1>
        <ProjectFormPopup
          action={createProject}
          clients={clients}
          mode="create"
          triggerLabel="+ Nuevo proyecto"
        />
      </div>

      {projects.length === 0 ? (
        <p className="empty-line">No hay proyectos activos.</p>
      ) : (
        <div className="card-grid">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </>
  );
}
