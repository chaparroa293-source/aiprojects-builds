"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { DirectoryRecord } from "@/lib/directory-actions";
import type { DirectoryKind } from "@/lib/directory-config";
import { PhoneLink } from "./PhoneLink";

/** "Benítez" y "benitez" tienen que encontrarse igual: se comparan sin
 *  tildes ni mayúsculas, que es como uno escribe cuando busca apurado. */
function fold(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * Lista del directorio con su filtro. Los registros vienen ya
 * ordenados por nombre desde el servidor; el filtro es sólo por
 * nombre y trabaja sobre lo que ya está en pantalla — a esta escala
 * no hace falta volver a consultar.
 */
export function DirectoryTable({
  kind,
  records,
  filterLabel,
}: {
  kind: DirectoryKind;
  records: DirectoryRecord[];
  filterLabel: string;
}) {
  const [query, setQuery] = useState("");
  const isPersonal = kind === "personal";

  const visible = useMemo(() => {
    const q = fold(query);
    if (!q) return records;
    return records.filter((r) => fold(r.name).includes(q));
  }, [records, query]);

  return (
    <>
      <div className="list-filter">
        <input
          type="search"
          className="search-input"
          placeholder={filterLabel}
          aria-label={filterLabel}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {visible.length === 0 ? (
        <p className="empty-line">
          Ningún nombre coincide con “{query.trim()}”. Probá con menos letras.
        </p>
      ) : (
        <div className="panel panel-flush">
          <table className="grid">
            <thead>
              <tr>
                <th>Nombre</th>
                {isPersonal ? <th>Rol</th> : null}
                <th>Teléfono</th>
                <th>Proyectos</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td className="strong">
                    <Link href={`/${kind}/${r.id}`}>{r.name}</Link>
                  </td>
                  {isPersonal ? (
                    <td className={r.rol ? "" : "is-empty"}>{r.rol ?? "—"}</td>
                  ) : null}
                  <td className={r.phone ? "" : "is-empty"}>
                    {r.phone ? <PhoneLink phone={r.phone} /> : "—"}
                  </td>
                  <td>
                    {r.linkedProjects.length === 0 ? (
                      <span className="is-empty">—</span>
                    ) : (
                      <span className="linked-projects">
                        {r.linkedProjects.map((p) => (
                          <Link
                            key={p.id}
                            href={`/proyectos/${p.id}`}
                            className={`linked-project ${
                              p.status === "FINISHED" || p.archived
                                ? "is-past"
                                : ""
                            }`}
                            title={
                              p.archived
                                ? "Archivado"
                                : p.status === "FINISHED"
                                  ? "Terminado"
                                  : "Activo"
                            }
                          >
                            {p.name}
                          </Link>
                        ))}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
