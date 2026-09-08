"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientOption, FormState } from "@/lib/project-actions";
import { formatGs } from "@/lib/money";
import { Popup, PopupActions } from "./Popup";
import { useActionSuccess } from "./useActionSuccess";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function ProjectFormPopup({
  action,
  clients,
  mode,
  triggerLabel,
  triggerClassName = "btn btn-primary",
  defaults,
}: {
  action: Action;
  clients: ClientOption[];
  mode: "create" | "edit";
  triggerLabel: string;
  triggerClassName?: string;
  defaults?: {
    name: string;
    clientId: string | null;
    agreedTotalPrice: number;
    status: "ACTIVE" | "FINISHED";
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { error: null },
  );
  useActionSuccess(state, () => {
    setOpen(false);
    router.refresh();
  });

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>

      {open ? (
        <Popup
          title={mode === "create" ? "Nuevo proyecto" : "Editar proyecto"}
          onClose={() => setOpen(false)}
          width={440}
        >
          <form action={formAction} className="popup-form">
            <div className="field">
              <label htmlFor="pr-name">Nombre del proyecto *</label>
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
                  mode === "edit" && defaults
                    ? formatGs(defaults.agreedTotalPrice)
                    : ""
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
              onCancel={() => setOpen(false)}
            />
          </form>
        </Popup>
      ) : null}
    </>
  );
}
