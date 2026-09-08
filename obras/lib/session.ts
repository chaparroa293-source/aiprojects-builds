/**
 * Sesión: una cookie firmada, sin estado en la base.
 *
 * Usa Web Crypto (no `node:crypto`) a propósito: este módulo lo importa
 * el middleware, que corre en el runtime Edge, donde `node:crypto` no
 * existe. La verificación de la contraseña —que sí necesita scrypt—
 * vive aparte en `lib/password.ts` y sólo la importa la acción de
 * ingreso, que corre en Node.
 *
 * El token es `<expira>.<hmac>`: no lleva identidad adentro porque no
 * hay usuarios, sólo un portón compartido.
 */

export const SESSION_COOKIE = "obras_sesion";

/** Ocho horas: una jornada. Después hay que volver a entrar. */
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

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

/** Token firmado que vence en `ttlSeconds`. */
export async function createSessionToken(
  secret: string,
  ttlSeconds: number = SESSION_TTL_SECONDS,
): Promise<string> {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = String(expiresAt);
  const signature = await crypto.subtle.sign(
    "HMAC",
    await hmacKey(secret),
    encoder.encode(payload),
  );
  return `${payload}.${toHex(signature)}`;
}

/**
 * Válido = firma correcta Y no vencido. Cualquier otra cosa (token
 * ausente, mal formado, firmado con otro secreto) es "no". La
 * comparación la hace crypto.subtle.verify, no un === sobre strings.
 */
export async function verifySessionToken(
  secret: string,
  token: string | undefined | null,
): Promise<boolean> {
  if (!token) return false;

  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = fromHex(token.slice(separator + 1));
  if (!signature) return false;

  let valid: boolean;
  try {
    valid = await crypto.subtle.verify(
      "HMAC",
      await hmacKey(secret),
      signature as unknown as BufferSource,
      encoder.encode(payload),
    );
  } catch {
    return false;
  }
  if (!valid) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Math.floor(Date.now() / 1000);
}
