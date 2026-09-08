import Link from "next/link";
import { createProject, listClientOptions } from "@/lib/project-actions";
import { ProjectForm } from "@/app/_components/ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const clients = await listClientOptions();

  return (
    <>
      <p className="breadcrumb">
        <Link href="/proyectos">Proyectos</Link> / Nuevo proyecto
      </p>
      <div className="page-header">
        <h1 className="page-title">Nuevo proyecto</h1>
      </div>

      <ProjectForm
        action={createProject}
        clients={clients}
        cancelHref="/proyectos"
        submitLabel="Crear proyecto"
        mode="create"
      />
    </>
  );
}
