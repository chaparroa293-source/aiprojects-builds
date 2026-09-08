import Link from "next/link";
import { notFound } from "next/navigation";
import { DIRECTORY, isDirectoryKind } from "@/lib/directory-config";
import {
  deleteRecord,
  getRecord,
  updateRecord,
} from "@/lib/directory-actions";
import { EntityForm } from "@/app/_components/EntityForm";
import { DeleteButton } from "@/app/_components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ kind: string; id: string }>;
}) {
  const { kind, id } = await params;
  if (!isDirectoryKind(kind)) notFound();

  const meta = DIRECTORY[kind];
  const record = await getRecord(kind, id);
  if (!record) notFound();

  const action = updateRecord.bind(null, kind, id);
  const remove = deleteRecord.bind(null, kind, id);

  return (
    <>
      <p className="breadcrumb">
        <Link href={`/${kind}`}>{meta.listTitle}</Link> / {record.name}
      </p>
      <div className="page-header">
        <h1 className="page-title">Editar {meta.singular}</h1>
      </div>

      <EntityForm
        action={action}
        cancelHref={`/${kind}`}
        record={record}
        submitLabel="Guardar cambios"
      />

      <div style={{ marginTop: 32 }}>
        <DeleteButton
          action={remove}
          label={`Eliminar ${meta.singular}`}
          confirmMessage={`¿Eliminar a "${record.name}"? Esta acción no se puede deshacer.`}
        />
      </div>
    </>
  );
}
