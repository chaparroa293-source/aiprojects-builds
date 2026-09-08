"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  linkEmployee,
  linkSupplier,
  unlinkEmployee,
  unlinkSupplier,
  type DirectoryOption,
  type FormState,
  type ProjectTeam,
} from "@/lib/link-actions";
import { Popup, PopupActions } from "./Popup";
import { useActionSuccess } from "./useActionSuccess";

/**
 * Proveedores y personal vinculados a la obra (spec, sección 1:
 * el directorio es firm-wide y se reutiliza entre proyectos).
 */
export function ProjectTeamPanel({
  projectId,
  team,
}: {
  projectId: string;
  team: ProjectTeam;
}) {
  const [adding, setAdding] = useState<"supplier" | "employee" | null>(null);

  const linkedSupplierIds = new Set(team.suppliers.map((s) => s.id));
  const linkedEmployeeIds = new Set(team.employees.map((e) => e.id));

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Proveedores y personal</h2>
      </div>

      <div className="team-block">
        <div className="team-block-head">
          <h3 className="team-block-title">Proveedores</h3>
          <button
            type="button"
            className="link-btn"
            onClick={() => setAdding("supplier")}
          >
            + Vincular
          </button>
        </div>
        <ChipList
          projectId={projectId}
          items={team.suppliers}
          hrefBase="/proveedores"
          kind="supplier"
          emptyText="Ninguno vinculado todavía."
        />
      </div>

      <div className="team-block">
        <div className="team-block-head">
          <h3 className="team-block-title">Personal</h3>
          <button
            type="button"
            className="link-btn"
            onClick={() => setAdding("employee")}
          >
            + Vincular
          </button>
        </div>
        <ChipList
          projectId={projectId}
          items={team.employees}
          hrefBase="/personal"
          kind="employee"
          emptyText="Nadie vinculado todavía."
        />
      </div>

      {adding ? (
        <LinkPopup
          projectId={projectId}
          kind={adding}
          options={(adding === "supplier"
            ? team.allSuppliers
            : team.allEmployees
          ).filter((o) =>
            adding === "supplier"
              ? !linkedSupplierIds.has(o.id)
              : !linkedEmployeeIds.has(o.id),
          )}
          onClose={() => setAdding(null)}
        />
      ) : null}
    </section>
  );
}

function ChipList({
  projectId,
  items,
  hrefBase,
  kind,
  emptyText,
}: {
  projectId: string;
  items: DirectoryOption[];
  hrefBase: string;
  kind: "supplier" | "employee";
  emptyText: string;
}) {
  const router = useRouter();

  if (items.length === 0) {
    return <p className="muted">{emptyText}</p>;
  }

  async function unlink(id: string) {
    if (kind === "supplier") await unlinkSupplier(projectId, id);
    else await unlinkEmployee(projectId, id);
    router.refresh();
  }

  return (
    <ul className="chips">
      {items.map((item) => (
        <li key={item.id} className="chip">
          <Link href={`${hrefBase}/${item.id}`}>{item.name}</Link>
          <button
            type="button"
            className="chip-x"
            title="Desvincular de este proyecto"
            aria-label={`Desvincular ${item.name}`}
            onClick={() => unlink(item.id)}
          >
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

function LinkPopup({
  projectId,
  kind,
  options,
  onClose,
}: {
  projectId: string;
  kind: "supplier" | "employee";
  options: DirectoryOption[];
  onClose: () => void;
}) {
  const router = useRouter();
  const action =
    kind === "supplier"
      ? linkSupplier.bind(null, projectId)
      : linkEmployee.bind(null, projectId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { error: null },
  );
  useActionSuccess(state, () => {
    onClose();
    router.refresh();
  });

  const label = kind === "supplier" ? "un proveedor" : "una persona";

  return (
    <Popup
      title={kind === "supplier" ? "Vincular proveedor" : "Vincular personal"}
      subtitle="Del directorio de la firma, reutilizable en otras obras."
      onClose={onClose}
      width={420}
    >
      {options.length === 0 ? (
        <>
          <p className="popup-text">
            No hay {kind === "supplier" ? "proveedores" : "personal"} sin
            vincular. Cargá uno nuevo en el directorio primero.
          </p>
          <div className="popup-actions">
            <Link
              href={kind === "supplier" ? "/proveedores" : "/personal"}
              className="btn btn-primary"
            >
              Ir al directorio
            </Link>
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <form action={formAction} className="popup-form">
          <div className="field">
            <label htmlFor="link-select">Elegí {label}</label>
            <select
              id="link-select"
              name={kind === "supplier" ? "supplierId" : "employeeId"}
              defaultValue=""
              autoFocus
            >
              <option value="">— Elegí —</option>
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          {state.error ? <p className="form-error">{state.error}</p> : null}
          <PopupActions
            submitLabel="Vincular"
            pending={pending}
            onCancel={onClose}
          />
        </form>
      )}
    </Popup>
  );
}
