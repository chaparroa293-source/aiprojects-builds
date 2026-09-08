"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Único contenedor de popups de la app. Todo lo que se abre "encima"
 * usa esto, así el patrón es idéntico en cualquier pantalla:
 *  - clic afuera cierra
 *  - Escape cierra
 *  - siempre hay además un control visible de cerrar (la X del header)
 *  - el pie de acciones va siempre en el mismo orden: primaria, cancelar
 */
export function Popup({
  title,
  subtitle,
  onClose,
  children,
  width = 440,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div
        className="popup"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="popup-head">
          <div>
            <h2 className="popup-title">{title}</h2>
            {subtitle ? <p className="popup-subtitle">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            className="popup-close"
            onClick={onClose}
            aria-label="Cerrar"
            title="Cerrar (Esc)"
          >
            ✕
          </button>
        </div>
        <div className="popup-body">{children}</div>
      </div>
    </div>
  );
}

/** Pie de acciones estándar: primaria a la izquierda, cancelar a la derecha. */
export function PopupActions({
  submitLabel,
  pending,
  onCancel,
  cancelLabel = "Cancelar",
  danger = false,
}: {
  submitLabel: string;
  pending?: boolean;
  onCancel: () => void;
  cancelLabel?: string;
  danger?: boolean;
}) {
  return (
    <div className="popup-actions">
      <button
        type="submit"
        className={`btn ${danger ? "btn-danger-solid" : "btn-primary"}`}
        disabled={pending}
      >
        {pending ? "Guardando…" : submitLabel}
      </button>
      <button type="button" className="btn" onClick={onCancel}>
        {cancelLabel}
      </button>
    </div>
  );
}
