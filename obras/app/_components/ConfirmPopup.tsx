"use client";

import { useActionState, useState, type ReactNode } from "react";
import { Popup, PopupActions } from "./Popup";

type State = { error: string | null };
type Action = (prev: State, formData: FormData) => Promise<State>;

/**
 * Confirmación de borrado, con el mismo look que el resto de los
 * popups (reemplaza a window.confirm, que rompía la armonía visual).
 * Muestra el error del servidor en el propio popup — por ejemplo el
 * bloqueo por historial financiero — en vez de perderlo.
 */
export function ConfirmDeleteButton({
  action,
  triggerLabel,
  triggerClassName = "btn btn-danger",
  title,
  body,
  confirmLabel,
}: {
  action: Action;
  triggerLabel: string;
  triggerClassName?: string;
  title: string;
  body: ReactNode;
  confirmLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<State, FormData>(action, {
    error: null,
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
          <div className="popup-text">{body}</div>
          <form action={formAction}>
            {state.error ? <p className="form-error">{state.error}</p> : null}
            <PopupActions
              submitLabel={confirmLabel}
              pending={pending}
              onCancel={() => setOpen(false)}
              danger
            />
          </form>
        </Popup>
      ) : null}
    </>
  );
}
