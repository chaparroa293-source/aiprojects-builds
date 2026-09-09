/**
 * Crea una cuenta nombrada (OBRAS-012). Sin alta pública ni gestión
 * in-app a propósito — esta es la única puerta para crear una cuenta,
 * y corre contra lo que apunte DATABASE_URL en el momento (local o
 * producción, según el .env activo o las variables del shell).
 *
 *   npm run auth:create-user -- "Nombre" "usuario" "contraseña"
 *
 * La contraseña en sí no se guarda en ningún lado; sólo su hash.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { FIRM_ID } from "../lib/firm";
import { hashPassword } from "../lib/password";

async function main() {
  const [name, username, password] = process.argv.slice(2);

  if (!name || !username || !password) {
    console.error(
      'Uso: npm run auth:create-user -- "Nombre" "usuario" "contraseña"',
    );
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { firmId: FIRM_ID, name, username, passwordHash },
      select: { id: true, name: true, username: true },
    });
    console.log(
      `Cuenta creada: ${user.name} (usuario: ${user.username}, id: ${user.id})`,
    );
  } catch (err) {
    // P2002 = choque de unicidad — acá sólo puede ser el username.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      console.error(`Ya existe una cuenta con el usuario "${username}".`);
      process.exit(1);
    }
    throw err;
  } finally {
    await prisma.$disconnect();
  }
}

main();
