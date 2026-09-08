"use client";

import { useActionState, useState } from "react";
import type { FormState, PriceRevisionItem } from "@/lib/project-actions";
import { formatGsSymbol } from "@/lib/money";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function PriceRevisionPanel({
  currentPrice,
  revisions,
  action,
}: {
  currentPrice: number;
  revisions: PriceRevisionItem[];
  action: Action;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { error: null },
  );

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Precio acordado</h2>
        <button
          type="button"
          className="btn"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Cerrar" : "Revisar precio"}
        </button>
      </div>

      <p className="big-number">{formatGsSymbol(currentPrice)}</p>

      {open ? (
        <form action={formAction} className="inline-form">
          <div className="field">
            <label htmlFor="newValue">Nuevo precio (₲)</label>
            <input
              id="newValue"
              name="newValue"
              type="text"
              inputMode="numeric"
              placeholder="1.800.000"
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="reason">Motivo (opcional)</label>
            <input id="reason" name="reason" type="text" />
          </div>
          {state.error ? <p className="form-error">{state.error}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Guardando…" : "Registrar revisión"}
          </button>
        </form>
      ) : null}

      {revisions.length > 0 ? (
        <div className="revision-history">
          <h3 className="revision-history-title">Historial de revisiones</h3>
          <ul>
            {revisions.map((r) => (
              <li key={r.id}>
                <span className="muted">{fmtDate(r.createdAt)}</span>{" "}
                {formatGsSymbol(r.oldValue)} → {formatGsSymbol(r.newValue)}
                {r.reason ? (
                  <span className="muted"> · {r.reason}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted" style={{ fontSize: 13 }}>
          Sin revisiones. El precio vigente es el precio inicial del proyecto.
        </p>
      )}
    </section>
  );
}
