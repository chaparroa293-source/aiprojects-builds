// Guaraníes: enteros, sin decimales. Se muestran con punto como
// separador de miles (1.500.000), que es como se escriben normalmente.

/** 1500000 -> "1.500.000". Valores negativos conservan el signo. */
export function formatGs(value: number): string {
  const n = Math.trunc(Math.abs(value));
  const withDots = n.toLocaleString("de-DE"); // de-DE usa punto de miles
  return (value < 0 ? "-" : "") + withDots;
}

/** "₲ 1.500.000" para encabezados y tarjetas. */
export function formatGsSymbol(value: number): string {
  return `₲ ${formatGs(value)}`;
}

/**
 * Acepta lo que el usuario tipea ("1.500.000", "1500000", "1 500 000",
 * "₲1.500.000") y devuelve un entero, o null si no es un monto válido.
 * No permite decimales ni negativos.
 */
export function parseGs(input: string): number | null {
  const cleaned = input.replace(/[\s₲.]/g, "");
  if (cleaned === "" || !/^\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isSafeInteger(n) || n < 0) return null;
  return n;
}

/**
 * Porcentaje del precio acordado ya consumido, tal como se muestra.
 * Una sola definición para las dos superficies que lo enseñan (la
 * tarjeta de proyecto y el resumen del proyecto): antes la tarjeta
 * decía "<1%" y el resumen "0%" del mismo proyecto.
 *
 *  - sin precio acordado -> "—"
 *  - hay gasto pero redondea a 0 -> "<1%"
 *  - excedido -> el porcentaje real, sin techo (185%, no 100%)
 */
export function formatSpendPct(spent: number, agreed: number): string {
  if (agreed <= 0) return "—";
  const pct = Math.round((spent / agreed) * 100);
  if (pct === 0 && spent > 0) return "<1%";
  return `${pct}%`;
}

/**
 * Ancho de la barra de consumo, 0–100. Se separa del rótulo a
 * propósito: la barra sí tiene techo (no puede pasarse del riel),
 * el número no. Con gasto que redondea a 0% deja un mínimo visible
 * para que la barra no parezca vacía.
 */
export function spendBarWidth(spent: number, agreed: number): number {
  if (agreed <= 0 || spent <= 0) return 0;
  const pct = Math.round((spent / agreed) * 100);
  return Math.max(2, Math.min(100, pct));
}
