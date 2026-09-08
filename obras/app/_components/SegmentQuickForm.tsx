"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { getQuickAddData } from "@/lib/expense-actions";
import { createSegment, type FormState } from "@/lib/segment-actions";
import { PopupActions } from "./Popup";
import { ChipPicker, type ChipOption } from "./ChipPicker";
import { useActionSuccess } from "./useActionSuccess";

/**
 * Alta de segmento desde el menú universal: primero se elige el
 * proyecto (chips), después el nombre. Entra a la RAÍZ del árbol de ese
 * proyecto; se renesta después desde los controles del propio árbol.
 */
export function SegmentQuickForm({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [projects, setProjects] = useState<
    { id: string; name: string; finished: boolean }[] | null
  >(null);
  const [, startLoading] = useTransition();
  const [projectId, setProjectId] = useState("");
  const projectIdRef = useRef("");
  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  useEffect(() => {
    startLoading(async () => {
      const d = await getQuickAddData();
      setProjects(d.projects.map((p) => ({ id: p.id, name: p.name, finished: p.finished })));
      if (d.projects.length === 1) setProjectId(d.projects[0].id);
    });
  }, []);

  const action = useCallback(
    (prev: FormState, formData: FormData) =>
      createSegment(projectIdRef.current, null, prev, formData),
    [],
  );
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    { error: null },
  );
  useActionSuccess(state, onSaved);

  if (!projects) return <p className="muted">Cargando…</p>;
  if (projects.length === 0) {
    return (
      <>
        <p className="muted">
          No hay proyectos activos. Creá un proyecto primero.
        </p>
        <div className="popup-actions">
          <button type="button" className="btn" onClick={onCancel}>
            Cerrar
          </button>
        </div>
      </>
    );
  }

  const options: ChipOption[] = projects.map((p) => ({
    id: p.id,
    label: p.name,
    tag: p.finished ? "terminado" : undefined,
  }));

  return (
    <form action={formAction} className="popup-form">
      <div className="field">
        <label>Proyecto *</label>
        <ChipPicker
          ariaLabel="Proyecto"
          options={options}
          value={projectId || null}
          onChange={setProjectId}
        />
      </div>

      <div className="field">
        <label htmlFor="sq-name">Nombre del segmento *</label>
        <input id="sq-name" name="name" type="text" autoFocus />
        <span className="hint">
          Entra en la raíz del proyecto. Lo movés/anidás desde el árbol.
        </span>
      </div>

      {state.error ? <p className="form-error">{state.error}</p> : null}
      <PopupActions
        submitLabel="Agregar segmento"
        pending={pending}
        onCancel={onCancel}
      />
    </form>
  );
}
