"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteExpense,
  getExpenseEditContext,
  updateExpense,
  type ExpenseEditContext,
  type ExpenseFormState,
  type ExpenseListItem,
} from "@/lib/expense-actions";
import { formatGs, formatGsSymbol } from "@/lib/money";
import { Gs } from "./Gs";
import { Popup, PopupActions } from "./Popup";
import { useActionSuccess } from "./useActionSuccess";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ExpenseList({
  expenses,
  title = "Actividad reciente",
  limit,
  emptyText = "Todavía no hay gastos registrados.",
}: {
  expenses: ExpenseListItem[];
  title?: string;
  limit?: number;
  emptyText?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visible =
    limit && !showAll ? expenses.slice(0, limit) : expenses;

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">{title}</h2>
        <span className="muted">
          {expenses.length} gasto{expenses.length === 1 ? "" : "s"} ·{" "}
          <Gs value={expenses.reduce((a, e) => a + e.amount, 0)} />
        </span>
      </div>

      {expenses.length === 0 ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <>
          <table className="grid">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Segmento</th>
                <th>Proveedor</th>
                <th className="num">Monto</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id}>
                  <td className="muted nowrap">
                    {fmtDate(e.spentAt)}
                    {e.creatorName ? (
                      <span className="expense-creator">
                        {e.creatorName}
                      </span>
                    ) : null}
                  </td>
                  <td>
                    <span className="seg-path">{e.segmentLabel}</span>
                    {e.description ? (
                      <span className="muted"> · {e.description}</span>
                    ) : null}
                  </td>
                  <td className={e.supplierName ? "" : "muted"}>
                    {e.supplierName ?? "—"}
                  </td>
                  <td className="num strong">
                    <Gs value={e.amount} />
                  </td>
                  <td className="num">
                    <button
                      type="button"
                      className="link-btn"
                      onClick={() => setEditingId(e.id)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {limit && expenses.length > limit ? (
            <button
              type="button"
              className="link-btn"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll
                ? "Ver menos"
                : `Ver los ${expenses.length} gastos`}
            </button>
          ) : null}
        </>
      )}

      {editingId ? (
        <ExpenseEditPopup
          expenseId={editingId}
          onClose={() => setEditingId(null)}
        />
      ) : null}
    </section>
  );
}

function ExpenseEditPopup({
  expenseId,
  onClose,
}: {
  expenseId: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [ctx, setCtx] = useState<ExpenseEditContext | null>(null);
  const [supplierMode, setSupplierMode] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const [updateState, update, updating] = useActionState<
    ExpenseFormState,
    FormData
  >(updateExpense.bind(null, expenseId), { error: null });
  const [deleteState, remove, deleting] = useActionState<
    ExpenseFormState,
    FormData
  >(deleteExpense.bind(null, expenseId), { error: null });

  // Carga del contexto al montar el popup (dato externo → efecto).
  useEffect(() => {
    let cancelled = false;
    getExpenseEditContext(expenseId).then((loaded) => {
      if (cancelled) return;
      setCtx(loaded);
      setSupplierMode(loaded?.expense.supplierId ?? "");
    });
    return () => {
      cancelled = true;
    };
  }, [expenseId]);

  // Cerrar cuando guardó o borró bien.
  function done() {
    onClose();
    router.refresh();
  }
  useActionSuccess(updateState, done);
  useActionSuccess(deleteState, done);

  return (
    <Popup
      title="Editar gasto"
      subtitle={ctx ? ctx.expense.projectName : undefined}
      onClose={onClose}
      width={440}
    >
      {!ctx ? (
        <p className="muted">Cargando…</p>
      ) : confirming ? (
        <form action={remove} className="popup-form">
          <p className="popup-text">
            ¿Eliminar este gasto de <Gs value={ctx.expense.amount} />? Es un
            registro de dinero: no se puede deshacer.
          </p>
          {deleteState.error ? (
            <p className="form-error">{deleteState.error}</p>
          ) : null}
          <PopupActions
            submitLabel="Eliminar gasto"
            pending={deleting}
            onCancel={() => setConfirming(false)}
            cancelLabel="Volver"
            danger
          />
        </form>
      ) : (
        <>
          <form action={update} className="popup-form">
            <input
              type="hidden"
              name="projectId"
              value={ctx.expense.projectId}
            />

            <div className="field">
              <label htmlFor="ex-segment">Segmento</label>
              <select
                id="ex-segment"
                name="segmentId"
                defaultValue={ctx.expense.segmentId}
              >
                {ctx.segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="ex-amount">Monto (₲)</label>
              <input
                id="ex-amount"
                name="amount"
                type="text"
                inputMode="numeric"
                defaultValue={formatGs(ctx.expense.amount)}
                autoFocus
              />
            </div>

            <div className="field">
              <label htmlFor="ex-supplier">Proveedor</label>
              <select
                id="ex-supplier"
                name="supplierId"
                value={supplierMode ?? ""}
                onChange={(e) => setSupplierMode(e.target.value)}
              >
                <option value="">— Sin proveedor —</option>
                {ctx.suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="__new__">+ Nuevo proveedor…</option>
              </select>
            </div>

            {supplierMode === "__new__" ? (
              <div className="field">
                <label htmlFor="ex-new-supplier">
                  Nombre del nuevo proveedor
                </label>
                <input id="ex-new-supplier" name="newSupplierName" type="text" />
              </div>
            ) : null}

            <div className="field">
              <label htmlFor="ex-date">Fecha del gasto</label>
              <input
                id="ex-date"
                name="spentAt"
                type="date"
                defaultValue={ctx.expense.spentAt}
              />
            </div>

            <div className="field">
              <label htmlFor="ex-desc">Nota</label>
              <input
                id="ex-desc"
                name="description"
                type="text"
                defaultValue={ctx.expense.description ?? ""}
              />
            </div>

            {updateState.error ? (
              <p className="form-error">{updateState.error}</p>
            ) : null}

            <PopupActions
              submitLabel="Guardar cambios"
              pending={updating}
              onCancel={onClose}
            />
          </form>

          <hr className="popup-sep" />
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirming(true)}
          >
            Eliminar gasto
          </button>
        </>
      )}
    </Popup>
  );
}
