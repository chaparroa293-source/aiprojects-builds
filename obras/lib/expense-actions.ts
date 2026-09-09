"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FIRM_ID } from "@/lib/firm";
import { getCurrentUserId } from "@/lib/current-user";
import { parseGs } from "@/lib/money";

export type ExpenseFormState = { error: string | null; savedAt?: number };

export type QuickAddSegment = { id: string; label: string };

export type QuickAddProject = {
  id: string;
  name: string;
  finished: boolean;
  segments: QuickAddSegment[];
  lastUsedSegmentId: string | null;
};

export type SupplierOption = { id: string; name: string };

export type QuickAddData = {
  projects: QuickAddProject[];
  suppliers: SupplierOption[];
};

export type ExpenseListItem = {
  id: string;
  amount: number;
  description: string | null;
  spentAt: string;
  segmentLabel: string;
  supplierName: string | null;
  /** Quién lo cargó (OBRAS-012). Null en gastos de antes de las
   *  cuentas — eso es correcto, no un dato faltante. */
  creatorName: string | null;
};

export type ExpenseDetail = {
  id: string;
  projectId: string;
  projectName: string;
  segmentId: string;
  supplierId: string | null;
  amount: number;
  description: string | null;
  spentAt: string; // yyyy-mm-dd
};

type FlatSegment = { id: string; name: string; parentId: string | null };

/** "Obra gruesa / Cimientos / Excavación" para un segmento dado. */
function segmentPath(segId: string, flat: FlatSegment[]): string {
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

/** Segmentos ordenados en profundidad (padre antes que hijos), con label de ruta. */
function orderedSegments(flat: FlatSegment[]): QuickAddSegment[] {
  const childrenOf = new Map<string | null, FlatSegment[]>();
  for (const s of flat) {
    const list = childrenOf.get(s.parentId) ?? [];
    list.push(s);
    childrenOf.set(s.parentId, list);
  }
  for (const list of childrenOf.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, "es"));
  }
  const out: QuickAddSegment[] = [];
  const walk = (parentId: string | null, prefix: string) => {
    for (const s of childrenOf.get(parentId) ?? []) {
      const label = prefix ? `${prefix} / ${s.name}` : s.name;
      out.push({ id: s.id, label });
      walk(s.id, label);
    }
  };
  walk(null, "");
  return out;
}

export async function getQuickAddData(): Promise<QuickAddData> {
  const [projects, suppliers] = await Promise.all([
    prisma.project.findMany({
      where: { firmId: FIRM_ID, archivedAt: null },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        status: true,
        segments: { select: { id: true, name: true, parentId: true } },
        expenses: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { segmentId: true },
        },
      },
    }),
    prisma.supplier.findMany({
      where: { firmId: FIRM_ID },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return {
    suppliers,
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      finished: p.status === "FINISHED",
      segments: orderedSegments(p.segments),
      lastUsedSegmentId: p.expenses[0]?.segmentId ?? null,
    })),
  };
}

export async function listProjectExpenses(
  projectId: string,
): Promise<ExpenseListItem[]> {
  const [rows, flat] = await Promise.all([
    prisma.expense.findMany({
      where: { firmId: FIRM_ID, projectId },
      orderBy: [{ spentAt: "desc" }, { createdAt: "desc" }],
      include: {
        supplier: { select: { name: true } },
        createdByUser: { select: { name: true } },
      },
    }),
    prisma.segment.findMany({
      where: { firmId: FIRM_ID, projectId },
      select: { id: true, name: true, parentId: true },
    }),
  ]);

  return rows.map((e) => ({
    id: e.id,
    amount: Number(e.amount),
    description: e.description,
    spentAt: e.spentAt.toISOString(),
    segmentLabel: segmentPath(e.segmentId, flat),
    supplierName: e.supplier?.name ?? null,
    creatorName: e.createdByUser?.name ?? null,
  }));
}

export async function getExpense(id: string): Promise<ExpenseDetail | null> {
  const e = await prisma.expense.findFirst({
    where: { id, firmId: FIRM_ID },
    include: { project: { select: { name: true } } },
  });
  if (!e) return null;
  return {
    id: e.id,
    projectId: e.projectId,
    projectName: e.project.name,
    segmentId: e.segmentId,
    supplierId: e.supplierId,
    amount: Number(e.amount),
    description: e.description,
    spentAt: e.spentAt.toISOString().slice(0, 10),
  };
}

export type ExpenseEditContext = {
  expense: ExpenseDetail;
  segments: QuickAddSegment[];
  suppliers: SupplierOption[];
};

/** Todo lo necesario para editar un gasto (funciona incluso si el
 *  proyecto está archivado, a diferencia de getQuickAddData). */
export async function getExpenseEditContext(
  expenseId: string,
): Promise<ExpenseEditContext | null> {
  const expense = await getExpense(expenseId);
  if (!expense) return null;

  const [flat, suppliers] = await Promise.all([
    prisma.segment.findMany({
      where: { firmId: FIRM_ID, projectId: expense.projectId },
      select: { id: true, name: true, parentId: true },
    }),
    prisma.supplier.findMany({
      where: { firmId: FIRM_ID },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return { expense, segments: orderedSegments(flat), suppliers };
}

type ParsedExpense =
  | {
      ok: true;
      data: {
        projectId: string;
        segmentId: string;
        supplierId: string | null;
        amount: bigint;
        description: string | null;
        spentAt: Date;
      };
    }
  | { ok: false; error: string };

async function parseExpenseForm(formData: FormData): Promise<ParsedExpense> {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const segmentId = String(formData.get("segmentId") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const supplierRaw = String(formData.get("supplierId") ?? "").trim();
  const newSupplierName = String(formData.get("newSupplierName") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const spentAtRaw = String(formData.get("spentAt") ?? "").trim();

  if (!projectId) return { ok: false, error: "Elegí un proyecto." };
  if (!segmentId) return { ok: false, error: "Elegí un segmento." };

  const amount = parseGs(amountRaw);
  if (amount === null || amount <= 0) {
    return { ok: false, error: "El monto debe ser un número en guaraníes mayor a cero." };
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, firmId: FIRM_ID },
    select: { id: true },
  });
  if (!project) return { ok: false, error: "El proyecto no existe." };

  const segment = await prisma.segment.findFirst({
    where: { id: segmentId, firmId: FIRM_ID, projectId },
    select: { id: true },
  });
  if (!segment) {
    return { ok: false, error: "El segmento no pertenece a ese proyecto." };
  }

  let spentAt = new Date();
  if (spentAtRaw) {
    const parsed = new Date(`${spentAtRaw}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return { ok: false, error: "La fecha del gasto no es válida." };
    }
    spentAt = parsed;
  }

  // Proveedor: existente, o creado al vuelo con newSupplierName.
  let supplierId: string | null = null;
  if (supplierRaw === "__new__" && newSupplierName) {
    const created = await prisma.supplier.create({
      data: { firmId: FIRM_ID, name: newSupplierName },
      select: { id: true },
    });
    supplierId = created.id;
  } else if (supplierRaw && supplierRaw !== "__new__") {
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierRaw, firmId: FIRM_ID },
      select: { id: true },
    });
    if (!supplier) return { ok: false, error: "El proveedor no existe." };
    supplierId = supplier.id;
  }

  return {
    ok: true,
    data: {
      projectId,
      segmentId,
      supplierId,
      amount: BigInt(amount),
      description,
      spentAt,
    },
  };
}

export async function createExpense(
  _prev: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const parsed = await parseExpenseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  // Trazabilidad, no permisos: null si por lo que sea no hay sesión
  // legible (no debería pasar detrás del middleware, pero un gasto no
  // se bloquea por esto — sencillamente queda sin autor, igual que uno
  // histórico de antes de que existieran las cuentas).
  const createdByUserId = await getCurrentUserId();

  await prisma.expense.create({
    data: { firmId: FIRM_ID, createdByUserId, ...parsed.data },
  });

  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${parsed.data.projectId}`);
  return { error: null, savedAt: Date.now() };
}

export async function updateExpense(
  id: string,
  _prev: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const existing = await prisma.expense.findFirst({
    where: { id, firmId: FIRM_ID },
    select: { id: true },
  });
  if (!existing) return { error: "El gasto no existe." };

  const parsed = await parseExpenseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await prisma.expense.update({
    where: { id },
    data: {
      segmentId: parsed.data.segmentId,
      supplierId: parsed.data.supplierId,
      amount: parsed.data.amount,
      description: parsed.data.description,
      spentAt: parsed.data.spentAt,
      // El proyecto de un gasto no se cambia acá: un gasto es de un
      // proyecto. Para moverlo, se borra y se vuelve a cargar.
    },
  });

  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${parsed.data.projectId}`);
  // Sin redirect: la edición ocurre en un popup sobre la página del proyecto.
  return { error: null, savedAt: Date.now() };
}

export async function deleteExpense(
  id: string,
  _prev: ExpenseFormState,
  _formData: FormData,
): Promise<ExpenseFormState> {
  const e = await prisma.expense.findFirst({
    where: { id, firmId: FIRM_ID },
    select: { projectId: true },
  });
  if (!e) return { error: "El gasto no existe." };

  await prisma.expense.delete({ where: { id } });

  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${e.projectId}`);
  return { error: null, savedAt: Date.now() };
}
