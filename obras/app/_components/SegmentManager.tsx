"use client";

import { useActionState, useMemo, useState } from "react";
import type { FormState, SegmentNode } from "@/lib/segment-actions";
import {
  createSegment,
  renameSegment,
  reparentSegment,
  deleteSegment,
} from "@/lib/segment-actions";
import { formatGsSymbol } from "@/lib/money";
import { Popup, PopupActions } from "./Popup";

type TreeNode = SegmentNode & { children: TreeNode[] };

function buildTree(flat: SegmentNode[]): TreeNode[] {
  const byId = new Map<string, TreeNode>();
  flat.forEach((s) => byId.set(s.id, { ...s, children: [] }));
  const roots: TreeNode[] = [];
  byId.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function descendantMap(flat: SegmentNode[]): Map<string, Set<string>> {
  const childrenOf = new Map<string, string[]>();
  flat.forEach((s) => {
    if (s.parentId) {
      const list = childrenOf.get(s.parentId) ?? [];
      list.push(s.id);
      childrenOf.set(s.parentId, list);
    }
  });
  const map = new Map<string, Set<string>>();
  flat.forEach((s) => {
    const acc = new Set<string>();
    const stack = [...(childrenOf.get(s.id) ?? [])];
    while (stack.length) {
      const cur = stack.pop()!;
      if (!acc.has(cur)) {
        acc.add(cur);
        stack.push(...(childrenOf.get(cur) ?? []));
      }
    }
    map.set(s.id, acc);
  });
  return map;
}

export function SegmentManager({
  projectId,
  segments,
}: {
  projectId: string;
  segments: SegmentNode[];
}) {
  const tree = useMemo(() => buildTree(segments), [segments]);
  const descendants = useMemo(() => descendantMap(segments), [segments]);

  // Árbol entero expandido por defecto: sólo guardamos los colapsados.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [addParent, setAddParent] = useState<{ id: string | null; name: string } | null>(
    null,
  );
  const [editing, setEditing] = useState<TreeNode | null>(null);

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Segmentos</h2>
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setAddParent({ id: null, name: "" })}
        >
          + Segmento raíz
        </button>
      </div>

      {tree.length === 0 ? (
        <p className="muted">
          Todavía no hay segmentos. Agregá el primero con “+ Segmento raíz”.
        </p>
      ) : (
        <ul className="tree">
          {tree.map((node) => (
            <TreeBranch
              key={node.id}
              node={node}
              collapsed={collapsed}
              onToggle={toggle}
              onAdd={(n) => setAddParent({ id: n.id, name: n.name })}
              onEdit={setEditing}
            />
          ))}
        </ul>
      )}

      {addParent ? (
        <AddSegmentPopup
          projectId={projectId}
          parentId={addParent.id}
          parentName={addParent.name}
          onClose={() => setAddParent(null)}
        />
      ) : null}

      {editing ? (
        <EditSegmentPopup
          node={editing}
          allSegments={segments}
          forbidden={descendants.get(editing.id) ?? new Set()}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </section>
  );
}

function TreeBranch({
  node,
  collapsed,
  onToggle,
  onAdd,
  onEdit,
}: {
  node: TreeNode;
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  onAdd: (n: TreeNode) => void;
  onEdit: (n: TreeNode) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isCollapsed = collapsed.has(node.id);

  return (
    <li className="tree-node">
      <div className="tree-row">
        {hasChildren ? (
          <button
            type="button"
            className="tree-caret"
            onClick={() => onToggle(node.id)}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? "Expandir" : "Contraer"}
          >
            {isCollapsed ? "▸" : "▾"}
          </button>
        ) : (
          <span className="tree-caret tree-caret-empty" aria-hidden="true" />
        )}

        <span className="tree-name">{node.name}</span>

        {/* El número siempre visible: es una app de plata. */}
        <span
          className={`tree-spend ${node.totalSpend === 0 ? "is-zero" : ""}`}
          title={
            hasChildren
              ? `Propio: ${formatGsSymbol(node.ownSpend)} · Con subsegmentos: ${formatGsSymbol(node.totalSpend)}`
              : undefined
          }
        >
          {formatGsSymbol(node.totalSpend)}
          {hasChildren && node.ownSpend !== node.totalSpend ? (
            <span className="tree-spend-own">
              propio {formatGsSymbol(node.ownSpend)}
            </span>
          ) : null}
        </span>

        <span className="tree-actions">
          <button
            type="button"
            className="icon-btn"
            title="Agregar subsegmento"
            aria-label={`Agregar subsegmento en ${node.name}`}
            onClick={() => onAdd(node)}
          >
            +
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Editar segmento"
            aria-label={`Editar ${node.name}`}
            onClick={() => onEdit(node)}
          >
            ✎
          </button>
        </span>
      </div>

      {hasChildren && !isCollapsed ? (
        <ul className="tree">
          {node.children.map((child) => (
            <TreeBranch
              key={child.id}
              node={child}
              collapsed={collapsed}
              onToggle={onToggle}
              onAdd={onAdd}
              onEdit={onEdit}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function AddSegmentPopup({
  projectId,
  parentId,
  parentName,
  onClose,
}: {
  projectId: string;
  parentId: string | null;
  parentName: string;
  onClose: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createSegment.bind(null, projectId, parentId),
    { error: null },
  );
  // Se queda abierto para encadenar varios segmentos seguidos, igual
  // que la carga de gastos. La lista de abajo muestra los agregados.
  const [added, setAdded] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [lastState, setLastState] = useState(state);

  if (state !== lastState) {
    setLastState(state);
    if (state.error === null) {
      setAdded((prev) => [name, ...prev]);
      setName("");
    }
  }

  return (
    <Popup
      title={parentId ? "Nuevo subsegmento" : "Nuevo segmento"}
      subtitle={parentId ? `Dentro de: ${parentName}` : "En la raíz del proyecto"}
      onClose={onClose}
      width={420}
    >
      <form action={formAction} className="popup-form">
        <div className="field">
          <label htmlFor="seg-name">Nombre del segmento *</label>
          <input
            id="seg-name"
            name="name"
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {state.error ? <p className="form-error">{state.error}</p> : null}
        <PopupActions
          submitLabel="Agregar"
          pending={pending}
          onCancel={onClose}
          cancelLabel={added.length > 0 ? "Listo" : "Cancelar"}
        />
      </form>

      {added.length > 0 ? (
        <div className="session-log">
          <div className="session-log-head">
            ✓ {added.length} segmento{added.length === 1 ? "" : "s"} agregado
            {added.length === 1 ? "" : "s"}
          </div>
          <ul>
            {added.map((n, i) => (
              <li key={`${n}-${i}`}>{n}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Popup>
  );
}

function EditSegmentPopup({
  node,
  allSegments,
  forbidden,
  onClose,
}: {
  node: TreeNode;
  allSegments: SegmentNode[];
  forbidden: Set<string>;
  onClose: () => void;
}) {
  const [renameState, renameAction, renaming] = useActionState<FormState, FormData>(
    renameSegment.bind(null, node.id),
    { error: null },
  );
  const [moveState, moveAction, moving] = useActionState<FormState, FormData>(
    reparentSegment.bind(null, node.id),
    { error: null },
  );
  const [deleteState, deleteAction, deleting] = useActionState<FormState, FormData>(
    deleteSegment.bind(null, node.id),
    { error: null },
  );
  const [confirming, setConfirming] = useState(false);

  const options = allSegments.filter(
    (s) => s.id !== node.id && !forbidden.has(s.id),
  );

  return (
    <Popup
      title="Editar segmento"
      subtitle={`${node.name} · ${formatGsSymbol(node.totalSpend)}`}
      onClose={onClose}
      width={440}
    >
      <form action={renameAction} className="popup-form">
        <div className="field">
          <label htmlFor="seg-rename">Nombre</label>
          <div className="row-inline">
            <input
              id="seg-rename"
              name="name"
              type="text"
              defaultValue={node.name}
            />
            <button type="submit" className="btn" disabled={renaming}>
              Renombrar
            </button>
          </div>
        </div>
        {renameState.error ? (
          <p className="form-error">{renameState.error}</p>
        ) : null}
      </form>

      <form action={moveAction} className="popup-form">
        <div className="field">
          <label htmlFor="seg-move">Mover bajo</label>
          <div className="row-inline">
            <select id="seg-move" name="parentId" defaultValue={node.parentId ?? ""}>
              <option value="">— Raíz del proyecto —</option>
              {options.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button type="submit" className="btn" disabled={moving}>
              Mover
            </button>
          </div>
          <span className="hint">
            No aparecen sus propios subsegmentos (evita ciclos).
          </span>
        </div>
        {moveState.error ? <p className="form-error">{moveState.error}</p> : null}
      </form>

      <hr className="popup-sep" />

      {confirming ? (
        <form action={deleteAction} className="popup-form">
          <p className="popup-text">
            ¿Eliminar “{node.name}”? Sólo se puede si no tiene subsegmentos ni
            gastos.
          </p>
          {deleteState.error ? (
            <p className="form-error">{deleteState.error}</p>
          ) : null}
          <PopupActions
            submitLabel="Eliminar segmento"
            pending={deleting}
            onCancel={() => setConfirming(false)}
            cancelLabel="Volver"
            danger
          />
        </form>
      ) : (
        <>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirming(true)}
          >
            Eliminar segmento
          </button>
          <span className="hint" style={{ marginLeft: 10 }}>
            Bloqueado si tiene subsegmentos o gastos.
          </span>
        </>
      )}
    </Popup>
  );
}
