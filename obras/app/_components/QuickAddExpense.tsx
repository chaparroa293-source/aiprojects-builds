"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createExpense,
  getQuickAddData,
  type QuickAddData,
  type QuickAddProject,
} from "@/lib/expense-actions";
import { formatGsSymbol } from "@/lib/money";
import { Popup } from "./Popup";

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

const STORE_KEY = "obras.quickadd.selection";

function readStored(): { projectId: string; segmentId: string } | null {
  try {
    const raw = sessionStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStored(projectId: string, segmentId: string) {
  try {
    sessionStorage.setItem(STORE_KEY, JSON.stringify({ projectId, segmentId }));
  } catch {
    /* ignorar */
  }
}

type LoggedEntry = {
  key: number;
  amount: number;
  projectName: string;
  segmentLabel: string;
  supplierName: string | null;
};

/**
 * Captura rápida de gastos: el flujo más usado de la app.
 *
 * El popup MANTIENE sus datos en estado local (los pide con
 * getQuickAddData al abrirse) en vez de recibirlos del shell. Eso es
 * lo que arregla la regresión del Slice 3: revalidar el shell ya no
 * puede desincronizar los selects, así que el popup puede quedarse
 * abierto después de guardar y encadenar varias cargas seguidas.
 */
export function QuickAddExpense({
  lockedProjectId,
  triggerLabel = "+ Gasto rápido",
  triggerClassName = "btn btn-primary quick-add-trigger",
}: {
  lockedProjectId?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<QuickAddData | null>(null);
  const [loading, startLoading] = useTransition();

  const [projectId, setProjectId] = useState(lockedProjectId ?? "");
  const [segmentId, setSegmentId] = useState("");
  const [supplierMode, setSupplierMode] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [amount, setAmount] = useState("");
  const [spentAt, setSpentAt] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [logged, setLogged] = useState<LoggedEntry[]>([]);

  const [state, formAction, pending] = useActionState(createExpense, {
    error: null as string | null,
  });

  const currentProject =
    data?.projects.find((p) => p.id === projectId) ?? null;

  function applyDefaults(d: QuickAddData) {
    const stored = lockedProjectId ? null : readStored();
    let pid = lockedProjectId ?? "";
    if (!pid && stored && d.projects.some((p) => p.id === stored.projectId)) {
      pid = stored.projectId;
    }
    if (!pid && d.projects.length === 1) pid = d.projects[0].id;

    const proj = d.projects.find((p) => p.id === pid) ?? null;
    let sid = defaultSegmentFor(proj);
    if (
      stored &&
      stored.projectId === pid &&
      proj?.segments.some((s) => s.id === stored.segmentId)
    ) {
      sid = stored.segmentId;
    }
    setProjectId(pid);
    setSegmentId(sid);
  }

  function openPopup() {
    setOpen(true);
    setLogged([]);
    startLoading(async () => {
      const d = await getQuickAddData();
      setData(d);
      applyDefaults(d);
    });
  }

  function closePopup() {
    setOpen(false);
    // Recién ahora refrescamos la página de atrás, para que revalidar
    // nunca toque el popup mientras está abierto.
    if (logged.length > 0) router.refresh();
  }

  // Tras un guardado exitoso: sumar a la lista de la sesión, limpiar
  // monto/nota/proveedor y dejar el formulario listo para el próximo.
  const [lastSavedAt, setLastSavedAt] = useState<number | undefined>(undefined);
  if (state.savedAt && state.savedAt !== lastSavedAt) {
    setLastSavedAt(state.savedAt);
    const parsed = Number(amount.replace(/[.\s₲]/g, "")) || 0;
    const segLabel =
      currentProject?.segments.find((s) => s.id === segmentId)?.label ?? "";
    const supplierName =
      supplierMode === "__new__"
        ? newSupplierName || null
        : data?.suppliers.find((s) => s.id === supplierMode)?.name ?? null;
    setLogged((prev) => [
      {
        key: state.savedAt as number,
        amount: parsed,
        projectName: currentProject?.name ?? "",
        segmentLabel: segLabel,
        supplierName,
      },
      ...prev,
    ]);
    setAmount("");
    setDescription("");
    setNewSupplierName("");
    setSupplierMode("");
    if (!lockedProjectId) writeStored(projectId, segmentId);
  }

  // Refrescar el catálogo (proveedor creado al vuelo, último segmento
  // usado) sin tocar la selección actual.
  useEffect(() => {
    if (!state.savedAt || !open) return;
    let cancelled = false;
    getQuickAddData().then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [state.savedAt, open]);

  function onProjectChange(id: string) {
    const proj = data?.projects.find((p) => p.id === id) ?? null;
    const seg = defaultSegmentFor(proj);
    setProjectId(id);
    setSegmentId(seg);
    if (!lockedProjectId) writeStored(id, seg);
  }

  function onSegmentChange(id: string) {
    setSegmentId(id);
    if (!lockedProjectId) writeStored(projectId, id);
  }

  const totalLogged = logged.reduce((acc, l) => acc + l.amount, 0);

  return (
    <>
      <button type="button" className={triggerClassName} onClick={openPopup}>
        {triggerLabel}
      </button>

      {open ? (
        <Popup
          title="Registrar gasto"
          subtitle="Proyecto → segmento → monto. El resto es opcional."
          onClose={closePopup}
          width={460}
        >
          {loading && !data ? (
            <p className="muted">Cargando…</p>
          ) : data && data.projects.length === 0 ? (
            <p className="muted">
              No hay proyectos activos. Creá un proyecto y al menos un segmento
              antes de registrar gastos.
            </p>
          ) : data ? (
            <>
              <form action={formAction} className="popup-form">
                {/* Un <select disabled> no se envía: el proyecto viaja acá. */}
                <input type="hidden" name="projectId" value={projectId} />

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
                    <span className="hint">
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <details className="popup-more">
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

                <div className="popup-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={pending}
                  >
                    {pending ? "Guardando…" : "Registrar gasto"}
                  </button>
                  <button type="button" className="btn" onClick={closePopup}>
                    Listo
                  </button>
                </div>
              </form>

              {logged.length > 0 ? (
                <div className="session-log">
                  <div className="session-log-head">
                    ✓ {logged.length} gasto{logged.length === 1 ? "" : "s"}{" "}
                    registrado{logged.length === 1 ? "" : "s"} ·{" "}
                    {formatGsSymbol(totalLogged)}
                  </div>
                  <ul>
                    {logged.map((l) => (
                      <li key={l.key}>
                        <span className="session-log-amount">
                          {formatGsSymbol(l.amount)}
                        </span>{" "}
                        <span className="muted">
                          {l.projectName} · {l.segmentLabel}
                          {l.supplierName ? ` · ${l.supplierName}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          ) : null}
        </Popup>
      ) : null}
    </>
  );
}
