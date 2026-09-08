"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FIRM_ID } from "@/lib/firm";

export type FormState = { error: string | null };

export type SegmentNode = {
  id: string;
  parentId: string | null;
  name: string;
  childCount: number;
  expenseCount: number;
};

export async function listSegments(projectId: string): Promise<SegmentNode[]> {
  const rows = await prisma.segment.findMany({
    where: { firmId: FIRM_ID, projectId },
    orderBy: { name: "asc" },
    include: { _count: { select: { children: true, expenses: true } } },
  });
  return rows.map((s) => ({
    id: s.id,
    parentId: s.parentId,
    name: s.name,
    childCount: s._count.children,
    expenseCount: s._count.expenses,
  }));
}

async function assertProject(projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, firmId: FIRM_ID },
    select: { id: true },
  });
  return Boolean(project);
}

export async function createSegment(
  projectId: string,
  parentId: string | null,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre del segmento es obligatorio." };

  if (!(await assertProject(projectId))) {
    return { error: "El proyecto no existe." };
  }

  if (parentId) {
    const parent = await prisma.segment.findFirst({
      where: { id: parentId, firmId: FIRM_ID, projectId },
      select: { id: true },
    });
    if (!parent) return { error: "El segmento padre no existe en este proyecto." };
  }

  await prisma.segment.create({
    data: { firmId: FIRM_ID, projectId, parentId, name },
  });

  revalidatePath(`/proyectos/${projectId}`);
  return { error: null };
}

export async function renameSegment(
  segmentId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "El nombre del segmento es obligatorio." };

  const seg = await prisma.segment.findFirst({
    where: { id: segmentId, firmId: FIRM_ID },
    select: { projectId: true },
  });
  if (!seg) return { error: "El segmento no existe." };

  await prisma.segment.update({ where: { id: segmentId }, data: { name } });

  revalidatePath(`/proyectos/${seg.projectId}`);
  return { error: null };
}

export async function reparentSegment(
  segmentId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawParent = String(formData.get("parentId") ?? "");
  const newParentId = rawParent.trim() || null;

  const seg = await prisma.segment.findFirst({
    where: { id: segmentId, firmId: FIRM_ID },
    select: { id: true, projectId: true, parentId: true },
  });
  if (!seg) return { error: "El segmento no existe." };

  if (newParentId === seg.parentId) return { error: null }; // sin cambios

  if (newParentId === segmentId) {
    return { error: "Un segmento no puede ser su propio padre." };
  }

  const all = await prisma.segment.findMany({
    where: { firmId: FIRM_ID, projectId: seg.projectId },
    select: { id: true, parentId: true },
  });

  if (newParentId) {
    const target = all.find((s) => s.id === newParentId);
    if (!target) return { error: "El segmento destino no existe en este proyecto." };

    // Evitar ciclos: el nuevo padre no puede ser un descendiente del segmento.
    const childrenOf = new Map<string, string[]>();
    for (const s of all) {
      if (s.parentId) {
        const list = childrenOf.get(s.parentId) ?? [];
        list.push(s.id);
        childrenOf.set(s.parentId, list);
      }
    }
    const descendants = new Set<string>();
    const stack = [segmentId];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const child of childrenOf.get(cur) ?? []) {
        if (!descendants.has(child)) {
          descendants.add(child);
          stack.push(child);
        }
      }
    }
    if (descendants.has(newParentId)) {
      return { error: "No se puede mover el segmento dentro de uno de sus propios subsegmentos." };
    }
  }

  await prisma.segment.update({
    where: { id: segmentId },
    data: { parentId: newParentId },
  });

  revalidatePath(`/proyectos/${seg.projectId}`);
  return { error: null };
}

export async function deleteSegment(
  segmentId: string,
  _prev: FormState,
  _formData: FormData,
): Promise<FormState> {
  const seg = await prisma.segment.findFirst({
    where: { id: segmentId, firmId: FIRM_ID },
    select: {
      projectId: true,
      _count: { select: { children: true, expenses: true } },
    },
  });
  if (!seg) return { error: "El segmento no existe." };

  // Regla de bloqueo (spec, decisión #2): no se puede eliminar un
  // segmento que todavía tiene subsegmentos y/o gastos. Hay que mover
  // o eliminar lo que cuelga de él primero. Nunca se pierde un
  // registro (y menos uno de dinero) en silencio.
  const kids = seg._count.children;
  const spend = seg._count.expenses;
  if (kids > 0 || spend > 0) {
    const parts: string[] = [];
    if (kids > 0) parts.push(`${kids} subsegmento${kids === 1 ? "" : "s"}`);
    if (spend > 0) parts.push(`${spend} gasto${spend === 1 ? "" : "s"}`);
    return {
      error: `No se puede eliminar: el segmento tiene ${parts.join(
        " y ",
      )}. Mové o eliminá ${
        spend > 0 ? "esos registros" : "los subsegmentos"
      } primero.`,
    };
  }

  await prisma.segment.delete({ where: { id: segmentId } });

  revalidatePath(`/proyectos/${seg.projectId}`);
  return { error: null };
}
