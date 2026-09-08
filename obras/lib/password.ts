import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Verificación de la contraseña compartida.
 *
 * Guarda un hash scrypt, no la contraseña: si alguien ve las variables
 * de entorno (panel de Vercel, un log, una captura), no se lleva la
 * contraseña. Usa `node:crypto`, así que este módulo NO lo puede
 * importar el middleware (Edge) — sólo la acción de ingreso.
 *
 * Formato guardado: `scrypt:<saltHex>:<hashHex>`.
 *
 * El separador es ":" y no "$" a propósito: los cargadores de .env
 * (dotenv-expand, que usa Next) interpretan "$algo" como una variable
 * y se comen el resto del valor. Con "$" el hash llegaba truncado a
 * "scrypt" y ninguna contraseña entraba.
 */

const KEY_LENGTH = 64;
const PREFIX = "scrypt";
const SEPARATOR = ":";

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
}

/** Genera el valor que va en AUTH_PASSWORD_HASH. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return [PREFIX, salt.toString("hex"), key.toString("hex")].join(SEPARATOR);
}

/**
 * Comparación en tiempo constante. Devuelve false ante cualquier hash
 * mal formado en vez de tirar error: un env mal cargado deja la app
 * cerrada, nunca abierta.
 */
export async function verifyPassword(
  password: string,
  stored: string | undefined,
): Promise<boolean> {
  if (!stored) return false;

  const parts = stored.split(SEPARATOR);
  if (parts.length !== 3 || parts[0] !== PREFIX) return false;

  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (salt.length === 0 || expected.length !== KEY_LENGTH) return false;

  let actual: Buffer;
  try {
    actual = await derive(password, salt);
  } catch {
    return false;
  }
  return timingSafeEqual(actual, expected);
}
