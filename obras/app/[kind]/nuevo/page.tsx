import Link from "next/link";
import { notFound } from "next/navigation";
import { DIRECTORY, isDirectoryKind } from "@/lib/directory-config";
import { createRecord } from "@/lib/directory-actions";
import { EntityForm } from "@/app/_components/EntityForm";

export default async function NewRecordPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isDirectoryKind(kind)) notFound();

  const meta = DIRECTORY[kind];
  const action = createRecord.bind(null, kind);

  return (
    <>
      <p className="breadcrumb">
        <Link href={`/${kind}`}>{meta.listTitle}</Link> / {meta.addLabel}
      </p>
      <div className="page-header">
        <h1 className="page-title">{meta.addLabel}</h1>
      </div>

      <EntityForm
        action={action}
        cancelHref={`/${kind}`}
        submitLabel="Crear"
      />
    </>
  );
}
