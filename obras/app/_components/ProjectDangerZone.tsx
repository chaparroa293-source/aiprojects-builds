"use client";

import { useRouter } from "next/navigation";
import type { FormState } from "@/lib/project-actions";
import { ConfirmDeleteButton } from "./ConfirmPopup";

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
  const router = useRouter();
  const canHardDelete = expenseCount === 0;

  async function archive() {
    await archiveAction();
    router.refresh();
  }
  async function unarchive() {
    await unarchiveAction();
    router.refresh();
  }

  return (
    <section className="panel danger-zone">
      <div className="panel-head">
        <h2 className="panel-title">
          {archived ? "Proyecto archivado" : "Archivar o eliminar"}
        </h2>
      </div>

      {archived ? (
        <>
          <p className="muted">
            Está fuera de la lista de proyectos activos. Sus registros siguen
            intactos.
          </p>
          <button type="button" className="btn" onClick={unarchive}>
            Desarchivar
          </button>
        </>
      ) : (
        <>
          <p className="muted">
            Archivar lo saca de la lista activa sin borrar nada. Se puede
            desarchivar cuando quieras.
          </p>
          <button type="button" className="btn" onClick={archive}>
            Archivar proyecto
          </button>
        </>
      )}

      <hr className="danger-sep" />

      {canHardDelete ? (
        <>
          <p className="muted">
            Este proyecto no tiene gastos. Al eliminarlo se borran también sus
            segmentos y el historial de precio.
          </p>
          <ConfirmDeleteButton
            action={deleteAction}
            triggerLabel="Eliminar proyecto"
            title="Eliminar proyecto"
            body={
              <>
                ¿Eliminar “{projectName}” y todo su contenido (segmentos e
                historial de precio)? No se puede deshacer.
              </>
            }
            confirmLabel="Eliminar proyecto"
          />
        </>
      ) : (
        <p className="muted">
          Este proyecto tiene {expenseCount} gasto
          {expenseCount === 1 ? "" : "s"} registrado
          {expenseCount === 1 ? "" : "s"}, así que no se puede eliminar (se
          perdería historial financiero). Si ya no está en uso, archivalo.
        </p>
      )}
    </section>
  );
}
