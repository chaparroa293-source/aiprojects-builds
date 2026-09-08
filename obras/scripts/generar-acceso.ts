/**
 * Genera los dos valores que necesita el portón de la app:
 *
 *   npx tsx scripts/generar-acceso.ts "la contraseña que quieras"
 *
 * Imprime AUTH_PASSWORD_HASH y SESSION_SECRET para pegar en el .env
 * (o en las variables de entorno de Vercel). La contraseña en sí no
 * se guarda en ningún lado.
 */
import { randomBytes } from "node:crypto";
import { hashPassword } from "../lib/password";

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Uso: npm run auth:hash -- "contraseña"');
    process.exit(1);
  }

  const hash = await hashPassword(password);
  const secret = randomBytes(32).toString("hex");

  console.log(`AUTH_PASSWORD_HASH="${hash}"`);
  console.log(`SESSION_SECRET="${secret}"`);
}

main();
