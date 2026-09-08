import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getProjectDetail,
  listClientOptions,
  updateProjectDetails,
} from "@/lib/project-actions";
import { ProjectForm } from "@/app/_components/ProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, clients] = await Promise.all([
    getProjectDetail(id),
    listClientOptions(),
  ]);
  if (!project) notFound();

  const action = updateProjectDetails.bind(null, id);

  return (
    <>
      <p className="breadcrumb">
        <Link href="/proyectos">Proyectos</Link> /{" "}
        <Link href={`/proyectos/${id}`}>{project.name}</Link> / Editar
      </p>
      <div className="page-header">
        <h1 className="page-title">Editar proyecto</h1>
      </div>

      <ProjectForm
        action={action}
        clients={clients}
        cancelHref={`/proyectos/${id}`}
        submitLabel="Guardar cambios"
        mode="edit"
        defaults={{
          name: project.name,
          clientId: project.clientId,
          agreedTotalPrice: project.agreedTotalPrice,
          status: project.status,
        }}
      />
    </>
  );
}
