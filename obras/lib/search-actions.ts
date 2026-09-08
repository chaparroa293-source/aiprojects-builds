"use server";

import { prisma } from "@/lib/prisma";
import { FIRM_ID } from "@/lib/firm";

/**
 * Búsqueda global, solo lectura. Cada resultado trae su contexto
 * completo (proyecto + ruta de segmento) para no tener que entrar a
 * ciegas a ver si es el que buscaba.
 */

export type SearchResult = {
  id: string;
  /** Etiqueta del tipo, en español, para agrupar visualmente. */
  group: "Proyectos" | "Clientes" | "Proveedores" | "Personal" | "Gastos";
  title: string;
  /** Contexto: cliente, ruta de segmento, teléfono, etc. */
  context: string | null;
  /** Monto en guaraníes, si aplica. Lo formatea <Gs> al pintarlo. */
  amount: number | null;
  href: string;
};

const TAKE = 6;

function pathOf(
  segId: string,
  flat: { id: string; name: string; parentId: string | null }[],
): string {
  const byId = new Map(flat.map((s) => [s.id, s]));
  const parts: string[] = [];
  let cur = byId.get(segId);
  let guard = 0;
  while (cur && guard++ < 50) {
    parts.unshift(cur.name);
    cur = cur.parentId ? byId.get(cur.parentId) : undefined;
  }
  return parts.join(" / ");
}

export async function globalSearch(rawQuery: string): Promise<SearchResult[]> {
  const q = rawQuery.trim();
  if (q.length < 2) return [];

  const contains = { contains: q, mode: "insensitive" as const };
  const digits = q.replace(/[.\s₲]/g, "");
  const asAmount = /^\d+$/.test(digits) ? BigInt(digits) : null;

  const [projects, clients, suppliers, employees, expenses] = await Promise.all([
    prisma.project.findMany({
      where: { firmId: FIRM_ID, name: contains },
      take: TAKE,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        archivedAt: true,
        client: { select: { name: true } },
      },
    }),
    prisma.client.findMany({
      where: { firmId: FIRM_ID, OR: [{ name: contains }, { phone: contains }] },
      take: TAKE,
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true },
    }),
    prisma.supplier.findMany({
      where: { firmId: FIRM_ID, OR: [{ name: contains }, { phone: contains }] },
      take: TAKE,
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true },
    }),
    prisma.employee.findMany({
      where: { firmId: FIRM_ID, OR: [{ name: contains }, { phone: contains }] },
      take: TAKE,
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true },
    }),
    prisma.expense.findMany({
      where: {
        firmId: FIRM_ID,
        OR: [
          { description: contains },
          { supplier: { name: contains } },
          ...(asAmount === null ? [] : [{ amount: asAmount }]),
        ],
      },
      take: TAKE,
      orderBy: [{ spentAt: "desc" }],
      include: {
        project: { select: { id: true, name: true } },
        supplier: { select: { name: true } },
      },
    }),
  ]);

  const segs = expenses.length
    ? await prisma.segment.findMany({
        where: {
          firmId: FIRM_ID,
          projectId: { in: [...new Set(expenses.map((e) => e.projectId))] },
        },
        select: { id: true, name: true, parentId: true },
      })
    : [];

  const results: SearchResult[] = [];

  for (const p of projects) {
    results.push({
      id: `p-${p.id}`,
      group: "Proyectos",
      title: p.name,
      context: [p.client?.name, p.archivedAt ? "archivado" : null]
        .filter(Boolean)
        .join(" · ") || null,
      amount: null,
      href: `/proyectos/${p.id}`,
    });
  }
  for (const c of clients) {
    results.push({
      id: `c-${c.id}`,
      group: "Clientes",
      title: c.name,
      context: c.phone,
      amount: null,
      href: `/clientes/${c.id}`,
    });
  }
  for (const s of suppliers) {
    results.push({
      id: `s-${s.id}`,
      group: "Proveedores",
      title: s.name,
      context: s.phone,
      amount: null,
      href: `/proveedores/${s.id}`,
    });
  }
  for (const e of employees) {
    results.push({
      id: `e-${e.id}`,
      group: "Personal",
      title: e.name,
      context: e.phone,
      amount: null,
      href: `/personal/${e.id}`,
    });
  }
  for (const x of expenses) {
    // Si el título ya es el proveedor (gasto sin nota), no lo repetimos
    // en el contexto.
    const title = x.description || x.supplier?.name || "Gasto";
    const showSupplier = x.supplier && title !== x.supplier.name;
    results.push({
      id: `g-${x.id}`,
      group: "Gastos",
      title,
      // Contexto completo: proyecto + ruta de segmento.
      context: `${x.project.name} · ${pathOf(x.segmentId, segs)}${
        showSupplier ? ` · ${x.supplier!.name}` : ""
      }`,
      amount: Number(x.amount),
      href: `/proyectos/${x.projectId}`,
    });
  }

  return results;
}
