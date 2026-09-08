"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import type { DirectoryRecord, FormState } from "@/lib/directory-actions";
import { Popup, PopupActions } from "./Popup";
import { useActionSuccess } from "./useActionSuccess";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Alta y edición de un registro del directorio. Mismo popup en los dos
 * casos y en los tres directorios: "agregar X" se ve y se comporta
 * igual en toda la app.
 */
export function DirectoryFormPopup({
  action,
  title,
  submitLabel,
  triggerLabel,
  triggerClassName = "btn btn-primary",
  record,
}: {
  action: Action;
  title: string;
  submitLabel: string;
  triggerLabel: string;
  triggerClassName?: string;
  record?: DirectoryRecord;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { error: null },
  );
  // Cerrar y refrescar cuando el guardado salió bien.
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
        <Popup title={title} onClose={() => setOpen(false)} width={420}>
          <form action={formAction} className="popup-form">
            <div className="field">
              <label htmlFor="dir-name">Nombre *</label>
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
              onCancel={() => setOpen(false)}
            />
          </form>
        </Popup>
      ) : null}
    </>
  );
}
