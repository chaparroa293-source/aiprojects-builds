"use server";

import { prisma } from "@/lib/prisma";
import { FIRM_ID } from "@/lib/firm";
import { listProjects, type ProjectListItem } from "@/lib/project-actions";

/** Un gasto visto desde el Panel: igual que en la ficha del proyecto,
 *  más el proyecto al que pertenece (acá ya no es implícito). */
export type PanelExpenseItem = {
  id: string;
  projectId: string;
  projectName: string;
  amount: number;
  description: string | null;
  spentAt: string;
  segmentLabel: string;
  supplierName: string | null;
};

export type PanelData = {
  /** La cartera activa, con la MISMA derivación que /proyectos. */
  projects: ProjectListItem[];
  activeCount: number;
  /** Σ de los gastos de los proyectos activos. */
  spend: number;
  /** Σ de los precios acordados de los proyectos activos. */
  agreed: number;
  /** agreed − spend. "Registrado", no ganancia real: es la misma
   *  cuenta que la Diferencia de cada proyecto, sumada. */
  margin: number;
  recentExpenses: PanelExpenseItem[];
};

type FlatSegment = { id: string; name: string; parentId: string | null };

/** "Obra gruesa / Cimientos / Excavación" a partir de la hoja. */
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

/**
 * Todo lo que muestra el Panel, en una sola lectura.
 *
 * Cartera activa = no archivado Y status ACTIVE — idéntico a lo que
 * lista /proyectos (de hecho reusa listProjects y el mismo filtro),
 * así el Panel y la lista no se pueden desincronizar. Lo terminado y
 * lo archivado vive en Historial y no cuenta acá.
 */
export async function getPanelData(recentLimit = 8): Promise<PanelData> {
  const all = await listProjects();
  const projects = all.filter((p) => p.status === "ACTIVE");

  const spend = projects.reduce((acc, p) => acc + p.expenseTotal, 0);
  const agreed = projects.reduce((acc, p) => acc + p.agreedTotalPrice, 0);

  const activeIds = projects.map((p) => p.id);

  const rows =
    activeIds.length === 0
      ? []
      : await prisma.expense.findMany({
          where: { firmId: FIRM_ID, projectId: { in: activeIds } },
          orderBy: [{ spentAt: "desc" }, { createdAt: "desc" }],
          take: recentLimit,
          include: {
            project: { select: { id: true, name: true } },
            supplier: { select: { name: true } },
          },
        });

  // Sólo los segmentos de los proyectos que aparecen en esas filas.
  const involved = [...new Set(rows.map((e) => e.projectId))];
  const segments =
    involved.length === 0
      ? []
      : await prisma.segment.findMany({
          where: { firmId: FIRM_ID, projectId: { in: involved } },
          select: { id: true, name: true, parentId: true },
        });

  const recentExpenses: PanelExpenseItem[] = rows.map((e) => ({
    id: e.id,
    projectId: e.project.id,
    projectName: e.project.name,
    amount: Number(e.amount),
    description: e.description,
    spentAt: e.spentAt.toISOString(),
    segmentLabel: segmentPath(e.segmentId, segments),
    supplierName: e.supplier?.name ?? null,
  }));

  return {
    projects,
    activeCount: projects.length,
    spend,
    agreed,
    margin: agreed - spend,
    recentExpenses,
  };
}
