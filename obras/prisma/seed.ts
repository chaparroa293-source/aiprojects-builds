import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const FIRM_ID = process.env.DEFAULT_FIRM_ID ?? "firm_default";

async function main() {
  await prisma.client.createMany({
    data: [
      { firmId: FIRM_ID, name: "Familia Gómez", phone: "0981 123 456" },
      { firmId: FIRM_ID, name: "Inmobiliaria del Este", phone: "021 555 200" },
    ],
  });
  await prisma.supplier.createMany({
    data: [
      { firmId: FIRM_ID, name: "Corralón San Blas", phone: "0971 456 789" },
      { firmId: FIRM_ID, name: "Hierros Paraguay S.A.", notes: "Entrega en obra" },
    ],
  });
  await prisma.employee.createMany({
    data: [
      { firmId: FIRM_ID, name: "Ramón Duarte", phone: "0985 111 222", notes: "Contramaestre" },
      { firmId: FIRM_ID, name: "Julio Benítez", phone: "0985 333 444" },
    ],
  });

  console.log("Seed cargado.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
