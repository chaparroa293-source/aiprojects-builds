"use client";

import { useEffect, useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const subtitleId = useId();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!mounted) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const shell = document.querySelector(".app-shell");
    const shellWasInert = shell?.hasAttribute("inert") ?? false;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    shell?.setAttribute("inert", "");
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;

    const focusHeading = () => dialogRef.current?.focus();
    focusHeading();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) {
        e.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      if (!shellWasInert) shell?.removeAttribute("inert");
      returnFocusRef.current?.focus();
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="popup-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="popup"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        tabIndex={-1}
        style={{ maxWidth: width }}
      >
        <div className="popup-head">
          <div>
            <h2 className="popup-title" id={titleId}>{title}</h2>
            {subtitle ? <p className="popup-subtitle" id={subtitleId}>{subtitle}</p> : null}
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
    </div>,
    document.body,
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
