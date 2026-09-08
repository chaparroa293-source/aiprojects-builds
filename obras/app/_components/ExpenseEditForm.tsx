"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type {
  ExpenseEditContext,
  ExpenseFormState,
} from "@/lib/expense-actions";
import { formatGs } from "@/lib/money";

type Action = (
  prev: ExpenseFormState,
  formData: FormData,
) => Promise<ExpenseFormState>;

export function ExpenseEditForm({
  ctx,
  updateAction,
  deleteAction,
}: {
  ctx: ExpenseEditContext;
  updateAction: Action;
  deleteAction: Action;
}) {
  const { expense, segments, suppliers } = ctx;
  const [supplierMode, setSupplierMode] = useState(expense.supplierId ?? "");
  const [updateState, update, updating] = useActionState<
    ExpenseFormState,
    FormData
  >(updateAction, { error: null });
  const [deleteState, remove] = useActionState<ExpenseFormState, FormData>(
    deleteAction,
    { error: null },
  );

  return (
    <>
      <form action={update} className="form">
        <input type="hidden" name="projectId" value={expense.projectId} />

        <div className="field">
          <label htmlFor="segmentId">Segmento *</label>
          <select
            id="segmentId"
            name="segmentId"
            defaultValue={expense.segmentId}
            required
          >
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="amount">Monto (₲) *</label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="numeric"
            required
            defaultValue={formatGs(expense.amount)}
          />
        </div>

        <div className="field">
          <label htmlFor="supplierId">Proveedor</label>
          <select
            id="supplierId"
            name="supplierId"
            value={supplierMode}
            onChange={(e) => setSupplierMode(e.target.value)}
          >
            <option value="">— Sin proveedor —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
            <option value="__new__">+ Nuevo proveedor…</option>
          </select>
        </div>

        {supplierMode === "__new__" ? (
          <div className="field">
            <label htmlFor="newSupplierName">Nombre del nuevo proveedor</label>
            <input id="newSupplierName" name="newSupplierName" type="text" />
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="spentAt">Fecha del gasto</label>
          <input
            id="spentAt"
            name="spentAt"
            type="date"
            defaultValue={expense.spentAt}
          />
        </div>

        <div className="field">
          <label htmlFor="description">Nota</label>
          <input
            id="description"
            name="description"
            type="text"
            defaultValue={expense.description ?? ""}
          />
        </div>

        {updateState.error ? (
          <p className="form-error">{updateState.error}</p>
        ) : null}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={updating}>
            {updating ? "Guardando…" : "Guardar cambios"}
          </button>
          <Link href={`/proyectos/${expense.projectId}`} className="btn">
            Cancelar
          </Link>
        </div>
      </form>

      <div style={{ marginTop: 32 }}>
        <form
          action={remove}
          onSubmit={(e) => {
            if (
              !window.confirm(
                "¿Eliminar este gasto? Es un registro de dinero: esta acción no se puede deshacer.",
              )
            ) {
              e.preventDefault();
            }
          }}
        >
          <button type="submit" className="btn btn-danger">
            Eliminar gasto
          </button>
        </form>
        {deleteState.error ? (
          <p className="form-error">{deleteState.error}</p>
        ) : null}
      </div>
    </>
  );
}
