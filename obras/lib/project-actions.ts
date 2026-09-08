"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProjectStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FIRM_ID } from "@/lib/firm";
import { parseGs } from "@/lib/money";

export type FormState = { error: string | null };

export type ProjectListItem = {
  id: string;
  name: string;
  clientName: string | null;
  status: ProjectStatus;
  agreedTotalPrice: number;
  segmentCount: number;
};

export type PriceRevisionItem = {
  id: string;
  oldValue: number;
  newValue: number;
  reason: string | null;
  createdAt: string;
};

export type ProjectDetail = {
  id: string;
  name: string;
  clientId: string | null;
  clientName: string | null;
  status: ProjectStatus;
  agreedTotalPrice: number;
  priceRevisions: PriceRevisionItem[];
};

export type ClientOption = { id: string; name: string };

export async function listClientOptions(): Promise<ClientOption[]> {
  const rows = await prisma.client.findMany({
    where: { firmId: FIRM_ID },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return rows;
}

export async function listProjects(): Promise<ProjectListItem[]> {
  const rows = await prisma.project.findMany({
    where: { firmId: FIRM_ID },
    orderBy: [{ status: "asc" }, { name: "asc" }],
    include: {
      client: { select: { name: true } },
      _count: { select: { segments: true } },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    clientName: p.client?.name ?? null,
    status: p.status,
    agreedTotalPrice: Number(p.agreedTotalPrice),
    segmentCount: p._count.segments,
  }));
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const p = await prisma.project.findFirst({
    where: { id, firmId: FIRM_ID },
    include: {
      client: { select: { name: true } },
      priceRevisions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    clientId: p.clientId,
    clientName: p.client?.name ?? null,
    status: p.status,
    agreedTotalPrice: Number(p.agreedTotalPrice),
    priceRevisions: p.priceRevisions.map((r) => ({
      id: r.id,
      oldValue: Number(r.oldValue),
      newValue: Number(r.newValue),
      reason: r.reason,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}

async function resolveClientId(raw: string): Promise<string | null> {
  const clientId = raw.trim();
  if (!clientId) return null;
  const client = await prisma.client.findFirst({
    where: { id: clientId, firmId: FIRM_ID },
    select: { id: true },
  });
  return client?.id ?? null;
}

export async function createProject(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const priceRaw = String(formData.get("agreedTotalPrice") ?? "").trim();
  const clientRaw = String(formData.get("clientId") ?? "");

  if (!name) return { error: "El nombre del proyecto es obligatorio." };

  const price = parseGs(priceRaw);
  if (price === null) {
    return { error: "El precio acordado debe ser un monto en guaraníes (solo números)." };
  }

  const clientId = await resolveClientId(clientRaw);

  const project = await prisma.project.create({
    data: {
      firmId: FIRM_ID,
      name,
      clientId,
      agreedTotalPrice: BigInt(price),
      // El precio inicial no cuenta como "revisión": el historial
      // registra los cambios posteriores.
    },
    select: { id: true },
  });

  revalidatePath("/proyectos");
  redirect(`/proyectos/${project.id}`);
}

export async function updateProjectDetails(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  const clientRaw = String(formData.get("clientId") ?? "");
  const statusRaw = String(formData.get("status") ?? "");

  if (!name) return { error: "El nombre del proyecto es obligatorio." };
  if (statusRaw !== "ACTIVE" && statusRaw !== "FINISHED") {
    return { error: "Estado inválido." };
  }

  const existing = await prisma.project.findFirst({
    where: { id, firmId: FIRM_ID },
    select: { id: true },
  });
  if (!existing) return { error: "El proyecto no existe." };

  const clientId = await resolveClientId(clientRaw);

  await prisma.project.update({
    where: { id },
    data: { name, clientId, status: statusRaw },
  });

  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${id}`);
  redirect(`/proyectos/${id}`);
}

export async function reviseProjectPrice(
  id: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const newRaw = String(formData.get("newValue") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || null;

  const newValue = parseGs(newRaw);
  if (newValue === null) {
    return { error: "El nuevo precio debe ser un monto en guaraníes (solo números)." };
  }

  const project = await prisma.project.findFirst({
    where: { id, firmId: FIRM_ID },
    select: { agreedTotalPrice: true },
  });
  if (!project) return { error: "El proyecto no existe." };

  const oldValue = Number(project.agreedTotalPrice);
  if (oldValue === newValue) {
    return { error: "El nuevo precio es igual al vigente: no hay nada que revisar." };
  }

  await prisma.$transaction([
    prisma.priceRevision.create({
      data: {
        firmId: FIRM_ID,
        projectId: id,
        oldValue: BigInt(oldValue),
        newValue: BigInt(newValue),
        reason,
      },
    }),
    prisma.project.update({
      where: { id },
      data: { agreedTotalPrice: BigInt(newValue) },
    }),
  ]);

  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${id}`);
  return { error: null };
}

export async function setProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<void> {
  await prisma.project.updateMany({
    where: { id, firmId: FIRM_ID },
    data: { status },
  });
  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${id}`);
}

export async function deleteProject(id: string): Promise<void> {
  // Slice 2: un proyecto todavía no tiene gastos. Al borrarlo se
  // eliminan en cascada sus segmentos y su historial de precio.
  // Cuando existan Gastos (Slice 3+), esto debe bloquearse si el
  // proyecto tiene gasto registrado — no se pierde historial financiero.
  await prisma.project.deleteMany({
    where: { id, firmId: FIRM_ID },
  });
  revalidatePath("/proyectos");
  redirect("/proyectos");
}
