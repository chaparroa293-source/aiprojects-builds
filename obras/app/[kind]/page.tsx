import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DIRECTORY,
  DIRECTORY_KINDS,
  isDirectoryKind,
} from "@/lib/directory-config";
import { createRecord, listRecords } from "@/lib/directory-actions";
import { DirectoryFormPopup } from "@/app/_components/DirectoryFormPopup";

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
          action={createRecord.bind(null, kind)}
          title={meta.addLabel}
          submitLabel="Crear"
          triggerLabel={`+ ${meta.addLabel}`}
        />
      </div>

      {records.length === 0 ? (
        <div className="panel">
          <p className="empty-state">{meta.emptyText}</p>
        </div>
      ) : (
        <div className="panel panel-flush">
          <table className="grid">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th className="num">Proyectos activos</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="strong">
                    <Link href={`/${kind}/${r.id}`}>{r.name}</Link>
                  </td>
                  <td className={r.phone ? "" : "muted"}>{r.phone ?? "—"}</td>
                  <td className="num muted">{r.activeProjectCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
