"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { FIRM_ID } from "@/lib/firm";
import {
  DIRECTORY,
  type DirectoryKind,
  isDirectoryKind,
} from "@/lib/directory-config";

export type LinkedProjectRef = {
  id: string;
  name: string;
  status: "ACTIVE" | "FINISHED";
  archived: boolean;
};

export type DirectoryRecord = {
  id: string;
  name: string;
  phone: string | null;
  /** RUC — identificador tributario paraguayo. Opcional, sin unicidad. */
  ruc: string | null;
  notes: string | null;
  activeProjectCount: number;
  /** Nombres de los proyectos vinculados (todos, no sólo activos),
   *  para mostrar la lista en vez de un número pelado. */
  linkedProjects: LinkedProjectRef[];
};

function delegate(kind: DirectoryKind) {
  // Los tres modelos comparten forma; el delegate concreto depende del kind.
  return prisma[DIRECTORY[kind].model] as typeof prisma.client;
}

/** Cuántos proyectos ACTIVOS (no archivados, no terminados) tiene
 *  vinculado cada registro del directorio. Solo lectura. */
async function activeProjectCounts(
  kind: DirectoryKind,
  ids: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (ids.length === 0) return counts;

  const activeProject = {
    firmId: FIRM_ID,
    status: "ACTIVE" as const,
    archivedAt: null,
  };

  if (kind === "clientes") {
    const rows = await prisma.project.groupBy({
      by: ["clientId"],
      where: { ...activeProject, clientId: { in: ids } },
      _count: { _all: true },
    });
    for (const r of rows) {
      if (r.clientId) counts.set(r.clientId, r._count._all);
    }
    return counts;
  }

  if (kind === "proveedores") {
    // Un proveedor cuenta en una obra si está vinculado explícitamente
    // O si tiene gastos ahí — la misma regla que usa su ficha, para que
    // el número de la lista y el del detalle nunca se contradigan.
    const [links, spends] = await Promise.all([
      prisma.projectSupplier.findMany({
        where: { firmId: FIRM_ID, supplierId: { in: ids }, project: activeProject },
        select: { supplierId: true, projectId: true },
      }),
      prisma.expense.findMany({
        where: { firmId: FIRM_ID, supplierId: { in: ids }, project: activeProject },
        select: { supplierId: true, projectId: true },
        distinct: ["supplierId", "projectId"],
      }),
    ]);
    const seen = new Map<string, Set<string>>();
    for (const r of [...links, ...spends]) {
      if (!r.supplierId) continue;
      const set = seen.get(r.supplierId) ?? new Set<string>();
      set.add(r.projectId);
      seen.set(r.supplierId, set);
    }
    for (const [supplierId, projectIds] of seen) {
      counts.set(supplierId, projectIds.size);
    }
    return counts;
  }

  const rows = await prisma.projectEmployee.findMany({
    where: { firmId: FIRM_ID, employeeId: { in: ids }, project: activeProject },
    select: { employeeId: true },
  });
  for (const r of rows) {
    counts.set(r.employeeId, (counts.get(r.employeeId) ?? 0) + 1);
  }
  return counts;
}

/** Proyectos vinculados (todos) por registro del directorio. Solo lectura,
 *  para mostrar los nombres en la lista en lugar de un conteo. */
async function linkedProjectsByRecord(
  kind: DirectoryKind,
  ids: string[],
): Promise<Map<string, LinkedProjectRef[]>> {
  const map = new Map<string, LinkedProjectRef[]>();
  if (ids.length === 0) return map;

  const projSelect = {
    id: true,
    name: true,
    status: true,
    archivedAt: true,
  } as const;
  const toRef = (p: {
    id: string;
    name: string;
    status: "ACTIVE" | "FINISHED";
    archivedAt: Date | null;
  }): LinkedProjectRef => ({
    id: p.id,
    name: p.name,
    status: p.status,
    archived: p.archivedAt !== null,
  });
  const push = (recordId: string, ref: LinkedProjectRef) => {
    const list = map.get(recordId) ?? [];
    if (!list.some((x) => x.id === ref.id)) list.push(ref);
    map.set(recordId, list);
  };

  if (kind === "clientes") {
    const rows = await prisma.project.findMany({
      where: { firmId: FIRM_ID, clientId: { in: ids } },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      select: { ...projSelect, clientId: true },
    });
    for (const p of rows) if (p.clientId) push(p.clientId, toRef(p));
    return map;
  }

  if (kind === "proveedores") {
    const [links, spends] = await Promise.all([
      prisma.projectSupplier.findMany({
        where: { firmId: FIRM_ID, supplierId: { in: ids } },
        select: { supplierId: true, project: { select: projSelect } },
      }),
      prisma.expense.findMany({
        where: { firmId: FIRM_ID, supplierId: { in: ids } },
        distinct: ["supplierId", "projectId"],
        select: { supplierId: true, project: { select: projSelect } },
      }),
    ]);
    for (const l of links) if (l.supplierId) push(l.supplierId, toRef(l.project));
    for (const e of spends) if (e.supplierId) push(e.supplierId, toRef(e.project));
    return map;
  }

  const links = await prisma.projectEmployee.findMany({
    where: { firmId: FIRM_ID, employeeId: { in: ids } },
    select: { employeeId: true, project: { select: projSelect } },
  });
  for (const l of links) push(l.employeeId, toRef(l.project));
  return map;
}

export async function listRecords(kind: DirectoryKind): Promise<DirectoryRecord[]> {
  const rows = await delegate(kind).findMany({
    where: { firmId: FIRM_ID },
    orderBy: { name: "asc" },
  });

  const ids = rows.map((r) => r.id);
  const [counts, linked] = await Promise.all([
    activeProjectCounts(kind, ids),
    linkedProjectsByRecord(kind, ids),
  ]);

  return rows.map((r) => {
    const projects = (linked.get(r.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    );
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      ruc: r.ruc,
      notes: r.notes,
      activeProjectCount: counts.get(r.id) ?? 0,
      linkedProjects: projects,
    };
  });
}

export async function getRecord(
  kind: DirectoryKind,
  id: string,
): Promise<DirectoryRecord | null> {
  const r = await delegate(kind).findFirst({
    where: { id, firmId: FIRM_ID },
  });
  if (!r) return null;
  const [counts, linked] = await Promise.all([
    activeProjectCounts(kind, [r.id]),
    linkedProjectsByRecord(kind, [r.id]),
  ]);
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    ruc: r.ruc,
    notes: r.notes,
    activeProjectCount: counts.get(r.id) ?? 0,
    linkedProjects: (linked.get(r.id) ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, "es"),
    ),
  };
}

export type LinkedProject = {
  id: string;
  name: string;
  status: "ACTIVE" | "FINISHED";
  archived: boolean;
  /** Solo para proveedores: cuánto se le gastó en ese proyecto. */
  spend: number | null;
};

export type LinkedExpense = {
  id: string;
  projectId: string;
  projectName: string;
  segmentLabel: string;
  amount: number;
  spentAt: string;
  description: string | null;
};

export type DirectoryDetail = {
  record: DirectoryRecord;
  projects: LinkedProject[];
  /** Solo proveedores. */
  expenses: LinkedExpense[];
  totalSpend: number | null;
};

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

/** Vista de detalle a pantalla completa de un registro del directorio:
 *  todo lo que tiene vinculado. Solo lectura. */
export async function getDirectoryDetail(
  kind: DirectoryKind,
  id: string,
): Promise<DirectoryDetail | null> {
  const record = await getRecord(kind, id);
  if (!record) return null;

  const select = {
    id: true,
    name: true,
    status: true,
    archivedAt: true,
  } as const;

  let projects: LinkedProject[] = [];
  let expenses: LinkedExpense[] = [];
  let totalSpend: number | null = null;

  if (kind === "clientes") {
    const rows = await prisma.project.findMany({
      where: { firmId: FIRM_ID, clientId: id },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      select,
    });
    projects = rows.map((p) => ({
      id: p.id,
      name: p.name,
      status: p.status,
      archived: p.archivedAt !== null,
      spend: null,
    }));
  } else if (kind === "proveedores") {
    const [links, rawExpenses] = await Promise.all([
      prisma.projectSupplier.findMany({
        where: { firmId: FIRM_ID, supplierId: id },
        select: { project: { select } },
      }),
      prisma.expense.findMany({
        where: { firmId: FIRM_ID, supplierId: id },
        orderBy: [{ spentAt: "desc" }, { createdAt: "desc" }],
        include: { project: { select: { id: true, name: true } } },
      }),
    ]);

    const spendByProject = new Map<string, number>();
    for (const e of rawExpenses) {
      spendByProject.set(
        e.projectId,
        (spendByProject.get(e.projectId) ?? 0) + Number(e.amount),
      );
    }

    // Un proveedor "pertenece" a un proyecto si está vinculado
    // explícitamente o si tiene gastos ahí.
    const byId = new Map<string, LinkedProject>();
    for (const l of links) {
      byId.set(l.project.id, {
        id: l.project.id,
        name: l.project.name,
        status: l.project.status,
        archived: l.project.archivedAt !== null,
        spend: spendByProject.get(l.project.id) ?? 0,
      });
    }
    for (const e of rawExpenses) {
      if (!byId.has(e.projectId)) {
        byId.set(e.projectId, {
          id: e.projectId,
          name: e.project.name,
          status: "ACTIVE",
          archived: false,
          spend: spendByProject.get(e.projectId) ?? 0,
        });
      }
    }
    projects = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));

    const segs = await prisma.segment.findMany({
      where: {
        firmId: FIRM_ID,
        projectId: { in: [...new Set(rawExpenses.map((e) => e.projectId))] },
      },
      select: { id: true, name: true, parentId: true },
    });

    expenses = rawExpenses.map((e) => ({
      id: e.id,
      projectId: e.projectId,
      projectName: e.project.name,
      segmentLabel: pathOf(e.segmentId, segs),
      amount: Number(e.amount),
      spentAt: e.spentAt.toISOString(),
      description: e.description,
    }));
    totalSpend = expenses.reduce((acc, e) => acc + e.amount, 0);
  } else {
    const links = await prisma.projectEmployee.findMany({
      where: { firmId: FIRM_ID, employeeId: id },
      select: { project: { select } },
    });
    projects = links
      .map((l) => ({
        id: l.project.id,
        name: l.project.name,
        status: l.project.status,
        archived: l.project.archivedAt !== null,
        spend: null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "es"));
  }

  return { record, projects, expenses, totalSpend };
}

type ParsedForm =
  | {
      ok: true;
      data: {
        name: string;
        phone: string | null;
        ruc: string | null;
        notes: string | null;
      };
    }
  | { ok: false; error: string };

function parseForm(formData: FormData): ParsedForm {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const ruc = String(formData.get("ruc") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  return {
    ok: true,
    data: {
      name,
      phone: phone || null,
      ruc: ruc || null,
      notes: notes || null,
    },
  };
}

export type FormState = { error: string | null };

export async function createRecord(
  kind: DirectoryKind,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isDirectoryKind(kind)) return { error: "Directorio inválido." };

  const parsed = parseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await delegate(kind).create({
    data: { ...parsed.data, firmId: FIRM_ID },
  });

  revalidatePath(`/${kind}`);
  // Sin redirect: el alta ocurre en un popup; el cliente lo cierra y refresca.
  return { error: null };
}

export async function updateRecord(
  kind: DirectoryKind,
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  if (!isDirectoryKind(kind)) return { error: "Directorio inválido." };

  const parsed = parseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  const existing = await delegate(kind).findFirst({
    where: { id, firmId: FIRM_ID },
  });
  if (!existing) return { error: "El registro no existe." };

  await delegate(kind).update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath(`/${kind}`);
  revalidatePath(`/${kind}/${id}`);
  return { error: null };
}

export async function deleteRecord(kind: DirectoryKind, id: string): Promise<void> {
  if (!isDirectoryKind(kind)) return;

  // Slice 1: no existe historial financiero todavía, así que el borrado
  // es directo. Cuando los Gastos referencien a estos registros, esto
  // pasa a ser archivado (no se pierde historial) — ver spec, sección 1.
  await delegate(kind).deleteMany({
    where: { id, firmId: FIRM_ID },
  });

  revalidatePath(`/${kind}`);
  redirect(`/${kind}`);
}
