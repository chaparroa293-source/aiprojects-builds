"use client";

import { useActionState, useMemo, useState } from "react";
import type { FormState, SegmentNode } from "@/lib/segment-actions";
import {
  createSegment,
  renameSegment,
  reparentSegment,
  deleteSegment,
} from "@/lib/segment-actions";

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

/** id -> set of all descendant ids (for reparent options in the UI). */
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

  return (
    <section className="panel">
      <div className="panel-head">
        <h2 className="panel-title">Segmentos</h2>
        <span className="muted" style={{ fontSize: 13 }}>
          Árbol de categorías de costo. Sin límite de profundidad.
        </span>
      </div>

      {tree.length === 0 ? (
        <p className="muted" style={{ fontSize: 13 }}>
          Todavía no hay segmentos. Agregá el primero abajo.
        </p>
      ) : (
        <ul className="segment-tree">
          {tree.map((node) => (
            <SegmentBranch
              key={node.id}
              node={node}
              projectId={projectId}
              allSegments={segments}
              descendants={descendants}
            />
          ))}
        </ul>
      )}

      <AddSegmentForm
        projectId={projectId}
        parentId={null}
        label="Agregar segmento raíz"
      />
    </section>
  );
}

function SegmentBranch({
  node,
  projectId,
  allSegments,
  descendants,
}: {
  node: TreeNode;
  projectId: string;
  allSegments: SegmentNode[];
  descendants: Map<string, Set<string>>;
}) {
  return (
    <li className="segment-node">
      <SegmentRow
        node={node}
        projectId={projectId}
        allSegments={allSegments}
        descendants={descendants}
      />
      {node.children.length > 0 ? (
        <ul className="segment-tree">
          {node.children.map((child) => (
            <SegmentBranch
              key={child.id}
              node={child}
              projectId={projectId}
              allSegments={allSegments}
              descendants={descendants}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function SegmentRow({
  node,
  projectId,
  allSegments,
  descendants,
}: {
  node: TreeNode;
  projectId: string;
  allSegments: SegmentNode[];
  descendants: Map<string, Set<string>>;
}) {
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  const [renameState, renameAction, renaming] = useActionState<FormState, FormData>(
    renameSegment.bind(null, node.id),
    { error: null },
  );
  const [reparentState, reparentAction] = useActionState<FormState, FormData>(
    reparentSegment.bind(null, node.id),
    { error: null },
  );
  const [deleteState, deleteAction, deleting] = useActionState<FormState, FormData>(
    deleteSegment.bind(null, node.id),
    { error: null },
  );

  const forbidden = descendants.get(node.id) ?? new Set<string>();
  const reparentOptions = allSegments.filter(
    (s) => s.id !== node.id && !forbidden.has(s.id),
  );

  return (
    <div className="segment-row">
      <div className="segment-row-main">
        <span className="segment-name">{node.name}</span>
        {node.childCount > 0 ? (
          <span className="segment-badge">
            {node.childCount} subsegmento{node.childCount === 1 ? "" : "s"}
          </span>
        ) : null}
        <span className="segment-actions">
          <button
            type="button"
            className="link-btn"
            onClick={() => setAdding((v) => !v)}
          >
            + Subsegmento
          </button>
          <button
            type="button"
            className="link-btn"
            onClick={() => setEditing((v) => !v)}
          >
            {editing ? "Cerrar" : "Editar"}
          </button>
        </span>
      </div>

      {adding ? (
        <div className="segment-sub">
          <AddSegmentForm
            projectId={projectId}
            parentId={node.id}
            label="Agregar"
            onDone={() => setAdding(false)}
          />
        </div>
      ) : null}

      {editing ? (
        <div className="segment-sub">
          <form action={renameAction} className="row-form">
            <input
              name="name"
              type="text"
              defaultValue={node.name}
              aria-label="Nuevo nombre"
            />
            <button className="btn" type="submit" disabled={renaming}>
              Renombrar
            </button>
          </form>
          {renameState.error ? (
            <p className="form-error">{renameState.error}</p>
          ) : null}

          <form action={reparentAction} className="row-form">
            <label className="muted" style={{ fontSize: 12 }}>
              Mover bajo:
            </label>
            <select name="parentId" defaultValue={node.parentId ?? ""}>
              <option value="">— Raíz —</option>
              {reparentOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button className="btn" type="submit">
              Mover
            </button>
          </form>
          {reparentState.error ? (
            <p className="form-error">{reparentState.error}</p>
          ) : null}

          <form action={deleteAction} className="row-form">
            <button className="btn btn-danger" type="submit" disabled={deleting}>
              Eliminar segmento
            </button>
            <span className="muted" style={{ fontSize: 12 }}>
              Solo si no tiene subsegmentos.
            </span>
          </form>
          {deleteState.error ? (
            <p className="form-error">{deleteState.error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function AddSegmentForm({
  projectId,
  parentId,
  label,
  onDone,
}: {
  projectId: string;
  parentId: string | null;
  label: string;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createSegment.bind(null, projectId, parentId),
    { error: null },
  );

  return (
    <div className="add-segment">
      <form
        action={async (fd) => {
          await formAction(fd);
          onDone?.();
        }}
        className="row-form"
      >
        <input
          name="name"
          type="text"
          placeholder="Nombre del segmento"
          required
          aria-label="Nombre del segmento"
        />
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? "…" : label}
        </button>
      </form>
      {state.error ? <p className="form-error">{state.error}</p> : null}
    </div>
  );
}
