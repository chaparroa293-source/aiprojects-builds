"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/project-actions";

type DeleteAction = (prev: FormState, formData: FormData) => Promise<FormState>;
type SimpleAction = () => Promise<void>;

export function ProjectDangerZone({
  projectName,
  archived,
  expenseCount,
  deleteAction,
  archiveAction,
  unarchiveAction,
}: {
  projectName: string;
  archived: boolean;
  expenseCount: number;
  deleteAction: DeleteAction;
  archiveAction: SimpleAction;
  unarchiveAction: SimpleAction;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(deleteAction, {
    error: null,
  });

  const canHardDelete = expenseCount === 0;

  return (
    <section className="panel danger-zone">
      <h2 className="panel-title">
        {archived ? "Proyecto archivado" : "Archivar o eliminar"}
      </h2>

      {archived ? (
        <>
          <p className="muted" style={{ fontSize: 13 }}>
            Está fuera de la lista de proyectos activos. Sus registros siguen
            intactos.
          </p>
          <form action={unarchiveAction}>
            <button type="submit" className="btn">
              Desarchivar
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="muted" style={{ fontSize: 13 }}>
            Archivar lo saca de la lista activa sin borrar nada. Se puede
            desarchivar cuando quieras.
          </p>
          <form action={archiveAction} style={{ marginBottom: 16 }}>
            <button type="submit" className="btn">
              Archivar proyecto
            </button>
          </form>
        </>
      )}

      <hr className="danger-sep" />

      {canHardDelete ? (
        <>
          <p className="muted" style={{ fontSize: 13 }}>
            Este proyecto no tiene gastos. Al eliminarlo se borran también sus
            segmentos y el historial de precio. No se puede deshacer.
          </p>
          <form
            action={formAction}
            onSubmit={(e) => {
              if (
                !window.confirm(
                  `¿Eliminar el proyecto "${projectName}" y todo su contenido? Esta acción no se puede deshacer.`,
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <button type="submit" className="btn btn-danger">
              Eliminar proyecto
            </button>
          </form>
        </>
      ) : (
        <p className="muted" style={{ fontSize: 13 }}>
          Este proyecto tiene {expenseCount} gasto
          {expenseCount === 1 ? "" : "s"} registrado
          {expenseCount === 1 ? "" : "s"}, así que no se puede eliminar (se
          perdería historial financiero). Si ya no está en uso, archivalo.
        </p>
      )}

      {state.error ? <p className="form-error">{state.error}</p> : null}
    </section>
  );
}
