"use client";

import { useActionState } from "react";
import type { ClientOption, FormState } from "@/lib/project-actions";
import { formatGs } from "@/lib/money";
import { PopupActions } from "./Popup";
import { useActionSuccess } from "./useActionSuccess";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Cuerpo compartido del alta/edición de proyecto. Lo usan
 * ProjectFormPopup (páginas de proyectos) y UniversalAdd.
 */
export function ProjectQuickForm({
  action,
  clients,
  mode,
  defaults,
  onCancel,
  onSaved,
}: {
  action: Action;
  clients: ClientOption[];
  mode: "create" | "edit";
  defaults?: {
    name: string;
    clientId: string | null;
    agreedTotalPrice: number;
    status: "ACTIVE" | "FINISHED";
  };
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { error: null },
  );
  useActionSuccess(state, onSaved);

  return (
    <form action={formAction} className="popup-form">
      <div className="field">
        <label htmlFor="pr-name">Nombre del proyecto</label>
        <input
          id="pr-name"
          name="name"
          type="text"
          autoFocus
          defaultValue={defaults?.name ?? ""}
        />
      </div>

      <div className="field">
        <label htmlFor="pr-client">Cliente</label>
        <select
          id="pr-client"
          name="clientId"
          defaultValue={defaults?.clientId ?? ""}
        >
          <option value="">— Sin cliente asignado —</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="pr-price">Precio total acordado (₲)</label>
        <input
          id="pr-price"
          name="agreedTotalPrice"
          type="text"
          inputMode="numeric"
          placeholder="1.500.000"
          readOnly={mode === "edit"}
          defaultValue={
            mode === "edit" && defaults ? formatGs(defaults.agreedTotalPrice) : ""
          }
        />
        <span className="hint">
          {mode === "edit"
            ? "Se cambia desde “Revisar precio”, para que quede en el historial."
            : "Solo números enteros, en guaraníes."}
        </span>
      </div>

      {mode === "edit" ? (
        <div className="field">
          <label htmlFor="pr-status">Estado</label>
          <select
            id="pr-status"
            name="status"
            defaultValue={defaults?.status ?? "ACTIVE"}
          >
            <option value="ACTIVE">Activo</option>
            <option value="FINISHED">Terminado</option>
          </select>
        </div>
      ) : null}

      {state.error ? <p className="form-error">{state.error}</p> : null}
      <PopupActions
        submitLabel={mode === "create" ? "Crear proyecto" : "Guardar cambios"}
        pending={pending}
        onCancel={onCancel}
      />
    </form>
  );
}
