"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createRecord } from "@/lib/directory-actions";
import {
  createProject,
  listClientOptions,
  type ClientOption,
} from "@/lib/project-actions";
import type { DirectoryKind } from "@/lib/directory-config";
import { Popup } from "./Popup";
import { ChipPicker, type ChipOption } from "./ChipPicker";
import { ExpenseQuickForm } from "./ExpenseQuickForm";
import { DirectoryQuickForm } from "./DirectoryQuickForm";
import { ProjectQuickForm } from "./ProjectQuickForm";
import { SegmentQuickForm } from "./SegmentQuickForm";

type AddKind =
  | "gasto"
  | "cliente"
  | "proveedor"
  | "personal"
  | "proyecto"
  | "segmento";

// Gasto primero y pre-seleccionado: es lo que más se usa, así el
// "paso previo" no cuesta ni un toque para el caso común.
const TYPES: { id: AddKind; label: string }[] = [
  { id: "gasto", label: "Gasto" },
  { id: "cliente", label: "Cliente" },
  { id: "proveedor", label: "Proveedor" },
  { id: "personal", label: "Personal" },
  { id: "proyecto", label: "Proyecto" },
  { id: "segmento", label: "Segmento" },
];

const DIR_KIND: Record<
  "cliente" | "proveedor" | "personal",
  { kind: DirectoryKind; label: string }
> = {
  cliente: { kind: "clientes", label: "Nuevo cliente" },
  proveedor: { kind: "proveedores", label: "Nuevo proveedor" },
  personal: { kind: "personal", label: "Nuevo integrante" },
};

const TITLES: Record<AddKind, string> = {
  gasto: "Registrar gasto",
  cliente: "Nuevo cliente",
  proveedor: "Nuevo proveedor",
  personal: "Nuevo integrante",
  proyecto: "Nuevo proyecto",
  segmento: "Nuevo segmento",
};

/**
 * Punto de entrada único para agregar cualquier cosa. Primer paso:
 * "¿qué agregás?" (chips). Gasto arranca elegido y su formulario ya
 * está visible, así la captura de gastos no pierde velocidad.
 */
export function UniversalAdd() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<AddKind>("gasto");
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [, loadClients] = useTransition();
  const dirty = useRef(false);

  // Traer clientes una vez (los necesita el alta de proyecto).
  useEffect(() => {
    if (!open) return;
    loadClients(async () => setClients(await listClientOptions()));
  }, [open]);

  function openMenu() {
    dirty.current = false;
    setKind("gasto");
    setOpen(true);
  }
  function close() {
    setOpen(false);
    if (dirty.current) {
      dirty.current = false;
      router.refresh();
    }
  }
  function savedAndClose() {
    dirty.current = true;
    close();
  }

  const typeOptions: ChipOption[] = TYPES.map((t) => ({
    id: t.id,
    label: t.label,
  }));

  return (
    <>
      <button
        type="button"
        className="btn btn-primary quick-add-trigger"
        onClick={openMenu}
      >
        + Agregar
      </button>

      {open ? (
        <Popup title={TITLES[kind]} onClose={close} width={480}>
          <div className="universal-types">
            <ChipPicker
              ariaLabel="Qué agregás"
              size="sm"
              options={typeOptions}
              value={kind}
              onChange={(id) => setKind(id as AddKind)}
            />
          </div>

          {kind === "gasto" ? (
            <ExpenseQuickForm
              onLogged={() => {
                dirty.current = true;
              }}
            />
          ) : null}

          {kind === "cliente" || kind === "proveedor" || kind === "personal" ? (
            <DirectoryQuickForm
              key={kind}
              action={createRecord.bind(null, DIR_KIND[kind].kind)}
              submitLabel="Crear"
              onCancel={close}
              onSaved={savedAndClose}
            />
          ) : null}

          {kind === "proyecto" ? (
            <ProjectQuickForm
              action={createProject}
              clients={clients}
              mode="create"
              onCancel={close}
              onSaved={savedAndClose}
            />
          ) : null}

          {kind === "segmento" ? (
            <SegmentQuickForm onCancel={close} onSaved={savedAndClose} />
          ) : null}
        </Popup>
      ) : null}
    </>
  );
}
