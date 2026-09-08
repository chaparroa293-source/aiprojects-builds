"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FormState, ClientOption } from "@/lib/project-actions";
import { formatGs } from "@/lib/money";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function ProjectForm({
  action,
  clients,
  cancelHref,
  submitLabel,
  mode,
  defaults,
}: {
  action: Action;
  clients: ClientOption[];
  cancelHref: string;
  submitLabel: string;
  mode: "create" | "edit";
  defaults?: {
    name: string;
    clientId: string | null;
    agreedTotalPrice: number;
    status: "ACTIVE" | "FINISHED";
  };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { error: null },
  );

  return (
    <form action={formAction} className="form">
      <div className="field">
        <label htmlFor="name">Nombre del proyecto *</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaults?.name ?? ""}
          autoFocus
        />
      </div>

      <div className="field">
        <label htmlFor="clientId">Cliente</label>
        <select
          id="clientId"
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
        {clients.length === 0 ? (
          <span className="muted" style={{ fontSize: 12 }}>
            No hay clientes en el directorio todavía. Podés crear el proyecto
            sin cliente y asignarlo después.
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="agreedTotalPrice">Precio total acordado (₲)</label>
        <input
          id="agreedTotalPrice"
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
          style={mode === "edit" ? { background: "var(--bg)" } : undefined}
        />
        <span className="muted" style={{ fontSize: 12 }}>
          {mode === "edit"
            ? "El precio se cambia desde “Revisar precio” en la página del proyecto, para que quede registrado en el historial."
            : "Solo números enteros, en guaraníes. Se muestra con puntos de miles."}
        </span>
      </div>

      {mode === "edit" ? (
        <div className="field">
          <label htmlFor="status">Estado</label>
          <select
            id="status"
            name="status"
            defaultValue={defaults?.status ?? "ACTIVE"}
          >
            <option value="ACTIVE">Activo</option>
            <option value="FINISHED">Terminado</option>
          </select>
        </div>
      ) : null}

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
