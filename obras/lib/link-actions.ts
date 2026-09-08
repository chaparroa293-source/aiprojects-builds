"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FIRM_ID } from "@/lib/firm";

export type FormState = { error: string | null };

export type DirectoryOption = { id: string; name: string };

export type ProjectTeam = {
  suppliers: DirectoryOption[];
  employees: DirectoryOption[];
  /** Todo el directorio, para el selector de "vincular". */
  allSuppliers: DirectoryOption[];
  allEmployees: DirectoryOption[];
};

export async function getProjectTeam(projectId: string): Promise<ProjectTeam> {
  const [links, empLinks, allSuppliers, allEmployees] = await Promise.all([
    prisma.projectSupplier.findMany({
      where: { firmId: FIRM_ID, projectId },
      select: { supplier: { select: { id: true, name: true } } },
    }),
    prisma.projectEmployee.findMany({
      where: { firmId: FIRM_ID, projectId },
      select: { employee: { select: { id: true, name: true } } },
    }),
    prisma.supplier.findMany({
      where: { firmId: FIRM_ID },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.employee.findMany({
      where: { firmId: FIRM_ID },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const byName = (a: DirectoryOption, b: DirectoryOption) =>
    a.name.localeCompare(b.name, "es");

  return {
    suppliers: links.map((l) => l.supplier).sort(byName),
    employees: empLinks.map((l) => l.employee).sort(byName),
    allSuppliers,
    allEmployees,
  };
}

export async function linkSupplier(
  projectId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const supplierId = String(formData.get("supplierId") ?? "").trim();
  if (!supplierId) return { error: "Elegí un proveedor." };

  const [project, supplier] = await Promise.all([
    prisma.project.findFirst({
      where: { id: projectId, firmId: FIRM_ID },
      select: { id: true },
    }),
    prisma.supplier.findFirst({
      where: { id: supplierId, firmId: FIRM_ID },
      select: { id: true },
    }),
  ]);
  if (!project) return { error: "El proyecto no existe." };
  if (!supplier) return { error: "El proveedor no existe." };

  await prisma.projectSupplier.upsert({
    where: { projectId_supplierId: { projectId, supplierId } },
    create: { firmId: FIRM_ID, projectId, supplierId },
    update: {},
  });

  revalidatePath(`/proyectos/${projectId}`);
  revalidatePath("/proveedores");
  return { error: null };
}

export async function unlinkSupplier(
  projectId: string,
  supplierId: string,
): Promise<void> {
  await prisma.projectSupplier.deleteMany({
    where: { firmId: FIRM_ID, projectId, supplierId },
  });
  revalidatePath(`/proyectos/${projectId}`);
  revalidatePath("/proveedores");
}

export async function linkEmployee(
  projectId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const employeeId = String(formData.get("employeeId") ?? "").trim();
  if (!employeeId) return { error: "Elegí una persona." };

  const [project, employee] = await Promise.all([
    prisma.project.findFirst({
      where: { id: projectId, firmId: FIRM_ID },
      select: { id: true },
    }),
    prisma.employee.findFirst({
      where: { id: employeeId, firmId: FIRM_ID },
      select: { id: true },
    }),
  ]);
  if (!project) return { error: "El proyecto no existe." };
  if (!employee) return { error: "La persona no existe." };

  await prisma.projectEmployee.upsert({
    where: { projectId_employeeId: { projectId, employeeId } },
    create: { firmId: FIRM_ID, projectId, employeeId },
    update: {},
  });

  revalidatePath(`/proyectos/${projectId}`);
  revalidatePath("/personal");
  return { error: null };
}

export async function unlinkEmployee(
  projectId: string,
  employeeId: string,
): Promise<void> {
  await prisma.projectEmployee.deleteMany({
    where: { firmId: FIRM_ID, projectId, employeeId },
  });
  revalidatePath(`/proyectos/${projectId}`);
  revalidatePath("/personal");
}
