/**
 * Sesión: una cookie firmada, sin estado en la base.
 *
 * Usa Web Crypto (no `node:crypto`) a propósito: este módulo lo importa
 * el middleware, que corre en el runtime Edge, donde `node:crypto` no
 * existe. La verificación de contraseña —que sí necesita scrypt— vive
 * aparte en `lib/password.ts` y sólo la importan la acción de ingreso y
 * el script de alta de cuentas, que corren en Node.
 *
 * El token es `<expira>.<userId>.<hmac>` (OBRAS-012: cuentas nombradas,
 * ya no un portón compartido). `userId` nunca lleva un punto (es un
 * cuid), así que separar por "." en exactamente 3 partes es seguro y
 * más simple que buscar el último separador. Un token del formato
 * viejo (`<expira>.<hmac>`, dos partes) falla el `length !== 3` y
 * queda rechazado sin más — no hay in camino de vuelta al portón
 * compartido.
 */

export const SESSION_COOKIE = "obras_sesion";

/** Ocho horas: una jornada. Después hay que volver a entrar. */
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

export type SessionPayload = { userId: string; expiresAt: number };

const encoder = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): Uint8Array | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) {
    return null;
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Token firmado para `userId`, que vence en `ttlSeconds`. */
export async function createSessionToken(
  secret: string,
  userId: string,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${expiresAt}.${userId}`;
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return `${payload}.${toHex(signature)}`;
}

/**
 * Válido = firma correcta Y no vencido. Cualquier otra cosa (token
 * ausente, mal formado, firmado con otro secreto, formato viejo de dos
 * partes) devuelve `null`. La comparación la hace crypto.subtle.verify,
 * no un === sobre strings.
 */
export async function verifySessionToken(
  secret: string,
  token: string | undefined | null,
): Promise<SessionPayload | null> {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [expiresAtRaw, userId, signatureHex] = parts;

  const signature = fromHex(signatureHex);
  if (!signature || !userId) return null;

  const payload = `${expiresAtRaw}.${userId}`;

  let valid: boolean;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      signature as unknown as BufferSource,
      encoder.encode(payload),
    );
  } catch {
    return null;
  }
  if (!valid) return null;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { userId, expiresAt };
}
