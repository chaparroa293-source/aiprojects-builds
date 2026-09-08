import Link from "next/link";
import { notFound } from "next/navigation";
import {
  DIRECTORY,
  DIRECTORY_KINDS,
  isDirectoryKind,
} from "@/lib/directory-config";
import { listRecords } from "@/lib/directory-actions";

// Datos en vivo desde Postgres — no prerenderizar.
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
        <Link href={`/${kind}/nuevo`} className="btn btn-primary">
          + {meta.addLabel}
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="card">
          <p className="empty-state">{meta.emptyText}</p>
        </div>
      ) : (
        <div className="card">
          <table className="directory">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Proyectos activos</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="row-name">
                    <Link href={`/${kind}/${r.id}`}>{r.name}</Link>
                  </td>
                  <td className={r.phone ? "" : "muted"}>{r.phone ?? "—"}</td>
                  <td className="muted">{r.activeProjectCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
