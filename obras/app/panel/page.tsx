import Link from "next/link";
import { getPanelData } from "@/lib/panel-actions";
import { formatSpendPct, spendBarWidth } from "@/lib/money";
import { Gs } from "@/app/_components/Gs";

export const dynamic = "force-dynamic";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Panel: la vista de conjunto de la cartera activa. Es para entender
 * cómo viene todo, no para operar — acá no se carga ni se edita nada;
 * cada fila lleva a su proyecto, que es donde se trabaja.
 *
 * Cartera activa = no archivado Y status ACTIVE, igual que /proyectos.
 * Lo terminado y lo archivado se mira en Historial.
 */
export default async function PanelPage() {
  const { projects, activeCount, spend, agreed, margin, recentExpenses } =
    await getPanelData();

  const over = margin < 0;
  const pctLabel = formatSpendPct(spend, agreed);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Panel</h1>
      </div>

      {activeCount === 0 ? (
        <p className="empty-line">
          No hay proyectos activos. Cuando tengas una obra en curso, acá vas a
          ver cómo viene la cartera.
        </p>
      ) : (
        <>
          {/* Cada cifra en su caja, con el mismo borde/radio/fondo que
              cualquier panel de la app. */}
          <div className="stat-grid">
            <div className="panel stat-card">
              <span className="spend-label">Proyectos activos</span>
              <span className="spend-value">{activeCount}</span>
            </div>
            <div className="panel stat-card">
              <span className="spend-label">Gastos registrados</span>
              <span className="spend-value">
                <Gs value={spend} />
              </span>
            </div>
            <div className="panel stat-card">
              {/* "Registrado" y no ganancia: es la Diferencia de cada
                  obra, sumada. No es la utilidad real. */}
              <span className="spend-label">Margen registrado</span>
              <span className={`spend-value ${over ? "is-over" : "is-ok"}`}>
                <Gs value={margin} />
              </span>
            </div>
          </div>
          <p className="spend-caption">
            {agreed > 0
              ? `${pctLabel} del total acordado de la cartera activa`
              : "Sin precios acordados cargados"}
          </p>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Proyectos a la vista</h2>
              <span className="muted">{activeCount}</span>
            </div>
            <table className="grid">
              <thead>
                <tr>
                  <th>Proyecto</th>
                  <th>Cliente</th>
                  <th className="num">Gastado</th>
                  <th className="num">%</th>
                  <th className="bar-col" />
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const rowOver = p.expenseTotal > p.agreedTotalPrice;
                  return (
                    <tr key={p.id}>
                      <td className="strong">
                        <Link href={`/proyectos/${p.id}`}>{p.name}</Link>
                      </td>
                      <td className={p.clientName ? "muted" : "is-empty"}>
                        {p.clientName ?? "Sin cliente"}
                      </td>
                      <td className="num strong">
                        <Gs value={p.expenseTotal} />
                      </td>
                      <td className={`num ${rowOver ? "is-over" : "muted"}`}>
                        {formatSpendPct(p.expenseTotal, p.agreedTotalPrice)}
                      </td>
                      <td className="bar-col">
                        <div className="spend-bar" aria-hidden="true">
                          <div
                            className={`spend-bar-fill ${
                              rowOver ? "is-over" : ""
                            }`}
                            style={{
                              width: `${spendBarWidth(
                                p.expenseTotal,
                                p.agreedTotalPrice,
                              )}%`,
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          <section className="panel">
            <div className="panel-head">
              <h2 className="panel-title">Actividad reciente</h2>
              <span className="muted">
                {recentExpenses.length} gasto
                {recentExpenses.length === 1 ? "" : "s"}
              </span>
            </div>
            {recentExpenses.length === 0 ? (
              <p className="muted">Todavía no hay gastos registrados.</p>
            ) : (
              <table className="grid">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Proyecto</th>
                    <th>Segmento</th>
                    <th>Proveedor</th>
                    <th className="num">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((e) => (
                    <tr key={e.id}>
                      <td className="muted nowrap">{fmtDate(e.spentAt)}</td>
                      <td className="strong">
                        <Link href={`/proyectos/${e.projectId}`}>
                          {e.projectName}
                        </Link>
                      </td>
                      <td>
                        <span className="seg-path">{e.segmentLabel}</span>
                        {e.description ? (
                          <span className="muted"> · {e.description}</span>
                        ) : null}
                      </td>
                      <td className={e.supplierName ? "" : "is-empty"}>
                        {e.supplierName ?? "—"}
                      </td>
                      <td className="num strong">
                        <Gs value={e.amount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </>
  );
}
