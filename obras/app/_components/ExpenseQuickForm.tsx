"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createExpense,
  getQuickAddData,
  type QuickAddData,
  type QuickAddProject,
} from "@/lib/expense-actions";
import { formatGsSymbol } from "@/lib/money";
import { ChipPicker, type ChipOption } from "./ChipPicker";

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

/** "Obra gruesa / Cimientos / Excavación" -> { leaf, path } */
function splitLabel(label: string): { leaf: string; path: string } {
  const parts = label.split(" / ");
  return { leaf: parts[parts.length - 1], path: parts.slice(0, -1).join(" / ") };
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

const NEW_SUPPLIER = "__new__";
const NO_SUPPLIER = "";

/**
 * Cuerpo del alta rápida de gastos: selección VISUAL con chips (no
 * dropdowns), monto como número. Se queda abierto tras guardar y lleva
 * una lista de "cargado en esta sesión" para encadenar varias cargas.
 *
 * Trae sus propios datos con getQuickAddData al montar, así revalidar
 * la página de atrás nunca desincroniza la selección.
 */
export function ExpenseQuickForm({
  lockedProjectId,
  onLogged,
}: {
  lockedProjectId?: string;
  onLogged?: () => void;
}) {
  const [data, setData] = useState<QuickAddData | null>(null);
  const [, startLoading] = useTransition();

  const [projectId, setProjectId] = useState(lockedProjectId ?? "");
  const [segmentId, setSegmentId] = useState("");
  const [supplierChoice, setSupplierChoice] = useState<string>(NO_SUPPLIER);
  const [newSupplierName, setNewSupplierName] = useState("");
  const [amount, setAmount] = useState("");
  const [spentAt, setSpentAt] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [showOptional, setShowOptional] = useState(false);
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

  // Cargar catálogo al montar.
  useEffect(() => {
    startLoading(async () => {
      const d = await getQuickAddData();
      setData(d);
      applyDefaults(d);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tras guardar bien: sumar a la lista de sesión, limpiar monto/nota,
  // dejar listo para el próximo.
  const [lastSavedAt, setLastSavedAt] = useState<number | undefined>(undefined);
  if (state.savedAt && state.savedAt !== lastSavedAt) {
    setLastSavedAt(state.savedAt);
    const parsed = Number(amount.replace(/[.\s₲]/g, "")) || 0;
    const segLabel =
      currentProject?.segments.find((s) => s.id === segmentId)?.label ?? "";
    const supplierName =
      supplierChoice === NEW_SUPPLIER
        ? newSupplierName || null
        : data?.suppliers.find((s) => s.id === supplierChoice)?.name ?? null;
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
    setSupplierChoice(NO_SUPPLIER);
    if (!lockedProjectId) writeStored(projectId, segmentId);
    onLogged?.();
  }

  // Recargar catálogo (proveedor nuevo, último segmento) sin tocar selección.
  useEffect(() => {
    if (!state.savedAt) return;
    let cancelled = false;
    getQuickAddData().then((d) => {
      if (!cancelled) setData(d);
    });
    return () => {
      cancelled = true;
    };
  }, [state.savedAt]);

  function pickProject(id: string) {
    const proj = data?.projects.find((p) => p.id === id) ?? null;
    const seg = defaultSegmentFor(proj);
    setProjectId(id);
    setSegmentId(seg);
    if (!lockedProjectId) writeStored(id, seg);
  }
  function pickSegment(id: string) {
    setSegmentId(id);
    if (!lockedProjectId) writeStored(projectId, id);
  }

  if (!data) return <p className="muted">Cargando…</p>;
  if (data.projects.length === 0) {
    return (
      <p className="muted">
        No hay proyectos activos. Creá un proyecto y al menos un segmento antes
        de registrar gastos.
      </p>
    );
  }

  const projectOptions: ChipOption[] = data.projects.map((p) => ({
    id: p.id,
    label: p.name,
    tag: p.finished ? "terminado" : undefined,
  }));

  const segChips: ChipOption[] = (currentProject?.segments ?? []).map((s) => {
    const { leaf, path } = splitLabel(s.label);
    return {
      id: s.id,
      label: leaf,
      sublabel: path || undefined,
      tag:
        currentProject?.lastUsedSegmentId === s.id ? "reciente" : undefined,
    };
  });
  // Recientes primero.
  segChips.sort((a, b) => {
    const ar = a.tag === "reciente" ? 0 : 1;
    const br = b.tag === "reciente" ? 0 : 1;
    return ar - br;
  });

  const supplierOptions: ChipOption[] = [
    { id: NO_SUPPLIER, label: "Sin proveedor" },
    ...data.suppliers.map((s) => ({ id: s.id, label: s.name })),
    { id: NEW_SUPPLIER, label: "+ Nuevo" },
  ];

  const totalLogged = logged.reduce((acc, l) => acc + l.amount, 0);

  return (
    <>
      <form action={formAction} className="popup-form">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="segmentId" value={segmentId} />
        <input
          type="hidden"
          name="supplierId"
          value={supplierChoice}
        />

        {!lockedProjectId ? (
          <div className="field">
            <label>Proyecto *</label>
            <ChipPicker
              ariaLabel="Proyecto"
              options={projectOptions}
              value={projectId || null}
              onChange={pickProject}
            />
          </div>
        ) : null}

        <div className="field">
          <label>Segmento *</label>
          {!currentProject ? (
            <p className="hint">Elegí un proyecto primero.</p>
          ) : segChips.length === 0 ? (
            <p className="hint">
              Este proyecto no tiene segmentos. Agregá uno en la página del
              proyecto primero.
            </p>
          ) : (
            <ChipPicker
              ariaLabel="Segmento"
              options={segChips}
              value={segmentId || null}
              onChange={pickSegment}
            />
          )}
        </div>

        <div className="field">
          <label htmlFor="eq-amount">Monto (₲) *</label>
          <input
            id="eq-amount"
            name="amount"
            type="text"
            inputMode="numeric"
            placeholder="150.000"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {showOptional ? (
          <>
            <div className="field">
              <label>Proveedor</label>
              <ChipPicker
                ariaLabel="Proveedor"
                size="sm"
                options={supplierOptions}
                value={supplierChoice}
                onChange={setSupplierChoice}
              />
            </div>

            {supplierChoice === NEW_SUPPLIER ? (
              <div className="field">
                <label htmlFor="eq-new-supplier">
                  Nombre del nuevo proveedor
                </label>
                <input
                  id="eq-new-supplier"
                  name="newSupplierName"
                  type="text"
                  value={newSupplierName}
                  onChange={(e) => setNewSupplierName(e.target.value)}
                />
              </div>
            ) : null}

            <div className="field">
              <label htmlFor="eq-date">Fecha del gasto</label>
              <input
                id="eq-date"
                name="spentAt"
                type="date"
                value={spentAt}
                onChange={(e) => setSpentAt(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="eq-desc">Nota</label>
              <input
                id="eq-desc"
                name="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </>
        ) : (
          <button
            type="button"
            className="link-btn"
            onClick={() => setShowOptional(true)}
          >
            + Proveedor, fecha o nota
          </button>
        )}

        {state.error ? <p className="form-error">{state.error}</p> : null}

        <div className="popup-actions">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Guardando…" : "Registrar gasto"}
          </button>
        </div>
      </form>

      {logged.length > 0 ? (
        <div className="session-log">
          <div className="session-log-head">
            ✓ {logged.length} gasto{logged.length === 1 ? "" : "s"} registrado
            {logged.length === 1 ? "" : "s"} · {formatGsSymbol(totalLogged)}
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
  );
}
