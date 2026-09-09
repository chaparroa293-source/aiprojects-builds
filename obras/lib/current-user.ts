import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * El usuario logueado, para las dos cosas que hacen falta: sellar
 * `createdByUserId` al crear un Proyecto/Gasto, y (si algún día hace
 * falta) saber quién está del otro lado. Nunca se usa para restringir
 * qué puede ver o hacer — las dos cuentas tienen acceso idéntico; esto
 * es trazabilidad, no permisos.
 *
 * Devuelve `null` sin tirar error ante cualquier cosa rara (sin
 * cookie, `SESSION_SECRET` sin configurar, token vencido) — quien
 * llama decide qué hacer con un `null` (típicamente: grabar el campo
 * como null, igual que en un registro histórico).
 */
export async function getCurrentUserId(): Promise<string | null> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return null;

  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(secret, token);
  return session?.userId ?? null;
}
