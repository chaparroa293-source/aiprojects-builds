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

export type DirectoryRecord = {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  activeProjectCount: number;
};

function delegate(kind: DirectoryKind) {
  // Los tres modelos comparten forma; el delegate concreto depende del kind.
  return prisma[DIRECTORY[kind].model] as typeof prisma.client;
}

export async function listRecords(kind: DirectoryKind): Promise<DirectoryRecord[]> {
  const rows = await delegate(kind).findMany({
    where: { firmId: FIRM_ID },
    orderBy: { name: "asc" },
  });

  // Los Proyectos llegan en el Slice 2. Hasta entonces el conteo de
  // proyectos activos vinculados es siempre 0, pero la columna ya existe.
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    notes: r.notes,
    activeProjectCount: 0,
  }));
}

export async function getRecord(
  kind: DirectoryKind,
  id: string,
): Promise<DirectoryRecord | null> {
  const r = await delegate(kind).findFirst({
    where: { id, firmId: FIRM_ID },
  });
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    notes: r.notes,
    activeProjectCount: 0,
  };
}

type ParsedForm =
  | { ok: true; data: { name: string; phone: string | null; notes: string | null } }
  | { ok: false; error: string };

function parseForm(formData: FormData): ParsedForm {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name) return { ok: false, error: "El nombre es obligatorio." };

  return {
    ok: true,
    data: {
      name,
      phone: phone || null,
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
  redirect(`/${kind}`);
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
  redirect(`/${kind}`);
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
