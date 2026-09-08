"use client";

import { useActionState } from "react";
import type { DirectoryRecord, FormState } from "@/lib/directory-actions";
import type { DirectoryKind } from "@/lib/directory-config";
import { PopupActions } from "./Popup";
import { useActionSuccess } from "./useActionSuccess";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Cuerpo compartido del alta/edición de un registro del directorio
 * (Cliente / Proveedor / Personal). Lo usan tanto DirectoryFormPopup
 * (en las páginas del directorio) como UniversalAdd.
 */
export function DirectoryQuickForm({
  kind,
  action,
  submitLabel,
  record,
  onCancel,
  onSaved,
}: {
  kind: DirectoryKind;
  action: Action;
  submitLabel: string;
  record?: DirectoryRecord;
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
        <label htmlFor="dir-name">Nombre</label>
        <input
          id="dir-name"
          name="name"
          type="text"
          autoFocus
          defaultValue={record?.name ?? ""}
        />
      </div>
      <div className="field">
        <label htmlFor="dir-phone">Teléfono</label>
        <input
          id="dir-phone"
          name="phone"
          type="text"
          inputMode="tel"
          defaultValue={record?.phone ?? ""}
        />
      </div>
      <div className="field">
        <label htmlFor="dir-ruc">RUC</label>
        <input
          id="dir-ruc"
          name="ruc"
          type="text"
          defaultValue={record?.ruc ?? ""}
        />
      </div>
      {kind === "personal" ? (
        <div className="field">
          <label htmlFor="dir-rol">Rol</label>
          <input
            id="dir-rol"
            name="rol"
            type="text"
            placeholder="Albañil, electricista…"
            defaultValue={record?.rol ?? ""}
          />
        </div>
      ) : null}
      <div className="field">
        <label htmlFor="dir-notes">Notas</label>
        <textarea
          id="dir-notes"
          name="notes"
          defaultValue={record?.notes ?? ""}
        />
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <PopupActions
        submitLabel={submitLabel}
        pending={pending}
        onCancel={onCancel}
      />
    </form>
  );
}
