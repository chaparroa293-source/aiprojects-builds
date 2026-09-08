"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormState, PriceRevisionItem } from "@/lib/project-actions";
import { formatGsSymbol } from "@/lib/money";
import { Popup, PopupActions } from "./Popup";
import { useActionSuccess } from "./useActionSuccess";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Lo primero que se ve en un proyecto: gastado vs. acordado.
 * Comparación estática, sin ritmo ni proyección (spec, sección 2).
 */
export function SpendSummary({
  agreedTotalPrice,
  spend,
  revisions,
  reviseAction,
}: {
  agreedTotalPrice: number;
  spend: number;
  revisions: PriceRevisionItem[];
  reviseAction: Action;
}) {
  const router = useRouter();
  const [openRevise, setOpenRevise] = useState(false);
  const [openHistory, setOpenHistory] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    reviseAction,
    { error: null },
  );
  useActionSuccess(state, () => {
    setOpenRevise(false);
    router.refresh();
  });

  const remaining = agreedTotalPrice - spend;
  const pct =
    agreedTotalPrice > 0
      ? Math.min(100, Math.round((spend / agreedTotalPrice) * 100))
      : 0;
  const over = remaining < 0;

  return (
    <section className="panel spend-panel">
      <div className="spend-grid">
        <div className="spend-cell">
          <span className="spend-label">Gastado a la fecha</span>
          <span className="spend-value">{formatGsSymbol(spend)}</span>
        </div>
        <div className="spend-cell">
          <span className="spend-label">Precio acordado</span>
          <span className="spend-value">{formatGsSymbol(agreedTotalPrice)}</span>
        </div>
        <div className="spend-cell">
          <span className="spend-label">
            {over ? "Excedido por" : "Diferencia"}
          </span>
          <span className={`spend-value ${over ? "is-over" : "is-ok"}`}>
            {formatGsSymbol(Math.abs(remaining))}
          </span>
        </div>
      </div>

      <div className="spend-bar" aria-hidden="true">
        <div
          className={`spend-bar-fill ${over ? "is-over" : ""}`}
          style={{ width: `${over ? 100 : pct}%` }}
        />
      </div>
      <p className="spend-caption">
        {agreedTotalPrice > 0
          ? `${pct}% del precio acordado`
          : "Sin precio acordado cargado"}
        {" · "}
        <button
          type="button"
          className="link-btn"
          onClick={() => setOpenRevise(true)}
        >
          Revisar precio
        </button>
        {revisions.length > 0 ? (
          <>
            {" · "}
            <button
              type="button"
              className="link-btn"
              onClick={() => setOpenHistory(true)}
            >
              Ver {revisions.length} revisión
              {revisions.length === 1 ? "" : "es"}
            </button>
          </>
        ) : null}
      </p>

      {openRevise ? (
        <Popup
          title="Revisar precio acordado"
          subtitle={`Vigente: ${formatGsSymbol(agreedTotalPrice)}`}
          onClose={() => setOpenRevise(false)}
          width={420}
        >
          <form action={formAction} className="popup-form">
            <div className="field">
              <label htmlFor="rev-value">Nuevo precio (₲) *</label>
              <input
                id="rev-value"
                name="newValue"
                type="text"
                inputMode="numeric"
                placeholder="1.800.000"
                autoFocus
              />
            </div>
            <div className="field">
              <label htmlFor="rev-reason">Motivo (opcional)</label>
              <input id="rev-reason" name="reason" type="text" />
            </div>
            {state.error ? <p className="form-error">{state.error}</p> : null}
            <PopupActions
              submitLabel="Registrar revisión"
              pending={pending}
              onCancel={() => setOpenRevise(false)}
            />
          </form>
        </Popup>
      ) : null}

      {openHistory ? (
        <Popup
          title="Historial de precio"
          onClose={() => setOpenHistory(false)}
          width={460}
        >
          <ul className="history-list">
            {revisions.map((r) => (
              <li key={r.id}>
                <span className="muted">{fmtDate(r.createdAt)}</span>{" "}
                {formatGsSymbol(r.oldValue)} → {formatGsSymbol(r.newValue)}
                {r.reason ? <span className="muted"> · {r.reason}</span> : null}
              </li>
            ))}
          </ul>
          <div className="popup-actions">
            <button
              type="button"
              className="btn"
              onClick={() => setOpenHistory(false)}
            >
              Cerrar
            </button>
          </div>
        </Popup>
      ) : null}
    </section>
  );
}
