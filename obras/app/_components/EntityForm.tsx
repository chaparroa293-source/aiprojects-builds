"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/lib/directory-actions";
import type { DirectoryRecord } from "@/lib/directory-actions";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function EntityForm({
  action,
  cancelHref,
  record,
  submitLabel,
}: {
  action: Action;
  cancelHref: string;
  record?: DirectoryRecord;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { error: null },
  );

  return (
    <form action={formAction} className="form">
      <div className="field">
        <label htmlFor="name">Nombre *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={record?.name ?? ""}
          autoFocus
        />
      </div>

      <div className="field">
        <label htmlFor="phone">Teléfono</label>
        <input
          id="phone"
          name="phone"
          type="text"
          inputMode="tel"
          defaultValue={record?.phone ?? ""}
        />
      </div>

      <div className="field">
        <label htmlFor="notes">Notas</label>
        <textarea id="notes" name="notes" defaultValue={record?.notes ?? ""} />
      </div>

      {state.error ? <p className="form-error">{state.error}</p> : null}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </button>
        <Link href={cancelHref} className="btn">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
