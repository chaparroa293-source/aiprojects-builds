// Postgres local sin Docker, para desarrollo/hand-test.
// Descarga un binario real de Postgres y lo corre en localhost:5433
// con las credenciales de .env (obras/obras/obras).
//
//   node scripts/pg-local.mjs         -> arranca y queda en primer plano
//   node scripts/pg-local.mjs stop    -> detiene y limpia
import EmbeddedPostgres from "embedded-postgres";
import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".pg-local");

const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "obras",
  password: "obras",
  port: 5433,
  persistent: true,
});

if (process.argv[2] === "stop") {
  try {
    await pg.stop();
  } catch {}
  await rm(dir, { recursive: true, force: true });
  console.log("Postgres local detenido y limpiado.");
  process.exit(0);
}

const fresh = !(await import("node:fs")).existsSync(dir);
if (fresh) await pg.initialise();
await pg.start();
if (fresh) {
  await pg.createDatabase("obras");
}
console.log("Postgres local escuchando en postgresql://obras:obras@localhost:5433/obras");

process.on("SIGINT", async () => {
  await pg.stop();
  process.exit(0);
});
process.on("SIGTERM", async () => {
  await pg.stop();
  process.exit(0);
});

// mantener vivo
setInterval(() => {}, 1 << 30);
