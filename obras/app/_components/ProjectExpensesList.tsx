import Link from "next/link";
import type { ExpenseListItem } from "@/lib/expense-actions";
import { formatGsSymbol } from "@/lib/money";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function ProjectExpensesList({
  projectId,
  expenses,
}: {
  projectId: string;
  expenses: ExpenseListItem[];
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Gastos registrados</h2>
        <span className="muted" style={{ fontSize: 13 }}>
          {expenses.length} en total. Los totales por segmento llegan más
          adelante.
        </span>
      </div>

      {expenses.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Todavía no hay gastos. Usá “Registrar gasto” arriba, o el botón de
          gasto rápido de la barra lateral.
        </p>
      ) : (
        <table className="directory">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Segmento</th>
              <th>Proveedor</th>
              <th style={{ textAlign: "right" }}>Monto</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id}>
                <td className="muted">{fmtDate(e.spentAt)}</td>
                <td>
                  {e.segmentLabel}
                  {e.description ? (
                    <span className="muted"> · {e.description}</span>
                  ) : null}
                </td>
                <td className={e.supplierName ? "" : "muted"}>
                  {e.supplierName ?? "—"}
                </td>
                <td style={{ textAlign: "right", fontWeight: 600 }}>
                  {formatGsSymbol(e.amount)}
                </td>
                <td style={{ textAlign: "right" }}>
                  <Link
                    href={`/proyectos/${projectId}/gastos/${e.id}`}
                    className="link-btn"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
