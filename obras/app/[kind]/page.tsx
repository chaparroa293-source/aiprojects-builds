import { notFound } from "next/navigation";
import {
  DIRECTORY,
  DIRECTORY_KINDS,
  isDirectoryKind,
} from "@/lib/directory-config";
import { createRecord, listRecords } from "@/lib/directory-actions";
import { DirectoryFormPopup } from "@/app/_components/DirectoryFormPopup";
import { DirectoryTable } from "@/app/_components/DirectoryTable";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return DIRECTORY_KINDS.map((kind) => ({ kind }));
}

export default async function DirectoryListPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind } = await params;
  if (!isDirectoryKind(kind)) notFound();

  const meta = DIRECTORY[kind];
  const records = await listRecords(kind);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">{meta.listTitle}</h1>
        <DirectoryFormPopup
          kind={kind}
          action={createRecord.bind(null, kind)}
          title={meta.addLabel}
          submitLabel="Crear"
          triggerLabel={`+ ${meta.addLabel}`}
        />
      </div>

      {records.length === 0 ? (
        <p className="empty-line">{meta.emptyText}</p>
      ) : (
        <DirectoryTable
          kind={kind}
          records={records}
          filterLabel={meta.filterLabel}
        />
      )}
    </>
  );
}
