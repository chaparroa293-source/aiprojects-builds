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
