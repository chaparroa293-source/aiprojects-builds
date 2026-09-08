"use client";

import { useActionState, useEffect, useState } from "react";
import type { QuickAddData, QuickAddProject } from "@/lib/expense-actions";
import { createExpense } from "@/lib/expense-actions";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultSegmentFor(project: QuickAddProject | null): string {
  if (!project) return "";
  if (
    project.lastUsedSegmentId &&
    project.segments.some((s) => s.id === project.lastUsedSegmentId)
  ) {
    return project.lastUsedSegmentId;
  }
  return project.segments[0]?.id ?? "";
}

// El quick-add global vive en el shell; puede remontarse al revalidar.
// Guardamos la última selección en sessionStorage para no perderla
// entre cargas rápidas sucesivas.
const STORE_KEY = "obras.quickadd.selection";

function readStoredSelection(): { projectId: string; segmentId: string } | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? (JSON.parse(raw) as { projectId: string; segmentId: string }) : null;
  } catch {
    return null;
  }
}

function writeStoredSelection(projectId: string, segmentId: string) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ projectId, segmentId }));
  } catch {
    /* almacenamiento no disponible: no pasa nada */
  }
}

export function QuickAddExpense({
  data,
  lockedProjectId,
  triggerLabel = "+ Gasto rápido",
  triggerClassName = "btn btn-primary quick-add-trigger",
}: {
  data: QuickAddData;
  lockedProjectId?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const findProject = (id: string) =>
    data.projects.find((p) => p.id === id) ?? null;

  // Selección inicial segura para SSR (sin tocar sessionStorage):
  // proyecto bloqueado > único proyecto existente > vacío.
  const ssrProjectId =
    lockedProjectId ??
    (data.projects.length === 1 ? data.projects[0].id : "");

  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState(ssrProjectId);
  const [segmentId, setSegmentId] = useState(() =>
    defaultSegmentFor(findProject(ssrProjectId)),
  );

  // Al montar en el cliente, restaurar la última selección guardada
  // (solo para el quick-add global, no cuando el proyecto está fijo).
  useEffect(() => {
    if (lockedProjectId) return;
    const stored = readStoredSelection();
    if (!stored) return;
    const proj = data.projects.find((p) => p.id === stored.projectId);
    if (!proj) return;
    const seg = proj.segments.some((s) => s.id === stored.segmentId)
      ? stored.segmentId
      : defaultSegmentFor(proj);
    // Sincronización única desde sessionStorage al montar.
    /* eslint-disable react-hooks/set-state-in-effect */
    setProjectId(stored.projectId);
    setSegmentId(seg);
    /* eslint-enable react-hooks/set-state-in-effect */
    // Solo al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [supplierMode, setSupplierMode] = useState("");
  const [amount, setAmount] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [spentAt, setSpentAt] = useState(todayISO());
  const [description, setDescription] = useState("");

  const [state, formAction, pending] = useActionState(createExpense, {
    error: null as string | null,
  });

  // Tras un guardado exitoso: guardar la selección, limpiar campos y
  // cerrar el panel. (Patrón "comparar con el render anterior", sin
  // useEffect.) Reabrir es un clic y sessionStorage repone proyecto+segmento.
  const [lastSavedAt, setLastSavedAt] = useState<number | undefined>(undefined);
  const [justSavedAt, setJustSavedAt] = useState<number | undefined>(undefined);
  if (state.savedAt && state.savedAt !== lastSavedAt) {
    setLastSavedAt(state.savedAt);
    setJustSavedAt(state.savedAt);
    setAmount("");
    setDescription("");
    setNewSupplierName("");
    setSupplierMode("");
    if (!lockedProjectId) writeStoredSelection(projectId, segmentId);
    setOpen(false);
  }

  const currentProject = findProject(projectId);

  function onProjectChange(id: string) {
    const seg = defaultSegmentFor(findProject(id));
    setProjectId(id);
    setSegmentId(seg);
    if (!lockedProjectId) writeStoredSelection(id, seg);
  }

  function onSegmentChange(id: string) {
    setSegmentId(id);
    if (!lockedProjectId) writeStoredSelection(projectId, id);
  }

  function openModal() {
    setJustSavedAt(undefined);
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  return (
    <>
      <button type="button" className={triggerClassName} onClick={openModal}>
        {triggerLabel}
      </button>
      {justSavedAt ? (
        <span className="quick-add-saved" role="status">
          ✓ Gasto registrado
        </span>
      ) : null}

      {open ? (
        <div className="modal-overlay" onClick={close}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Registrar gasto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <h2 className="panel-title">Registrar gasto</h2>
              <button type="button" className="link-btn" onClick={close}>
                Cerrar
              </button>
            </div>

            {data.projects.length === 0 ? (
              <p className="muted">
                No hay proyectos activos. Creá un proyecto y al menos un
                segmento antes de registrar gastos.
              </p>
            ) : (
              <form action={formAction} className="modal-form">
                {/* Un <select disabled> no se envía en el formulario:
                    el proyecto (bloqueado o no) viaja siempre acá. */}
                <input type="hidden" name="projectId" value={projectId} />

                {/* Orden pensado para captura rápida: proyecto → segmento → monto */}
                <div className="field">
                  <label htmlFor="qa-project">Proyecto *</label>
                  <select
                    id="qa-project"
                    value={projectId}
                    onChange={(e) => onProjectChange(e.target.value)}
                    disabled={Boolean(lockedProjectId)}
                  >
                    <option value="">— Elegí un proyecto —</option>
                    {data.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.finished ? " (terminado)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="qa-segment">Segmento *</label>
                  <select
                    id="qa-segment"
                    name="segmentId"
                    value={segmentId}
                    onChange={(e) => onSegmentChange(e.target.value)}
                    required
                    disabled={!currentProject}
                  >
                    <option value="">
                      {currentProject && currentProject.segments.length === 0
                        ? "— Este proyecto no tiene segmentos —"
                        : "— Elegí un segmento —"}
                    </option>
                    {currentProject?.segments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {currentProject && currentProject.segments.length === 0 ? (
                    <span className="muted" style={{ fontSize: 12 }}>
                      Agregá un segmento en la página del proyecto primero.
                    </span>
                  ) : null}
                </div>

                <div className="field">
                  <label htmlFor="qa-amount">Monto (₲) *</label>
                  <input
                    id="qa-amount"
                    name="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="150.000"
                    autoFocus
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <details className="modal-more">
                  <summary>Datos opcionales</summary>

                  <div className="field">
                    <label htmlFor="qa-supplier">Proveedor</label>
                    <select
                      id="qa-supplier"
                      name="supplierId"
                      value={supplierMode}
                      onChange={(e) => setSupplierMode(e.target.value)}
                    >
                      <option value="">— Sin proveedor —</option>
                      {data.suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                      <option value="__new__">+ Nuevo proveedor…</option>
                    </select>
                  </div>

                  {supplierMode === "__new__" ? (
                    <div className="field">
                      <label htmlFor="qa-new-supplier">
                        Nombre del nuevo proveedor
                      </label>
                      <input
                        id="qa-new-supplier"
                        name="newSupplierName"
                        type="text"
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                      />
                    </div>
                  ) : null}

                  <div className="field">
                    <label htmlFor="qa-date">Fecha del gasto</label>
                    <input
                      id="qa-date"
                      name="spentAt"
                      type="date"
                      value={spentAt}
                      onChange={(e) => setSpentAt(e.target.value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="qa-desc">Nota</label>
                    <input
                      id="qa-desc"
                      name="description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </details>

                {state.error ? (
                  <p className="form-error">{state.error}</p>
                ) : null}
                {state.savedAt ? (
                  <p className="form-ok">
                    Gasto registrado. Podés cargar otro.
                  </p>
                ) : null}

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={pending}
                  >
                    {pending ? "Guardando…" : "Registrar gasto"}
                  </button>
                  <button type="button" className="btn" onClick={close}>
                    Listo
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
