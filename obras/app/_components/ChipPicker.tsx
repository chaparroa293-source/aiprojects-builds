"use client";

import type { ReactNode } from "react";

export type ChipOption = {
  id: string;
  label: ReactNode;
  /** Texto chico debajo del label (p. ej. la ruta del segmento). */
  sublabel?: ReactNode;
  /** Etiqueta a la derecha (p. ej. "reciente" o un monto). */
  tag?: ReactNode;
  disabled?: boolean;
};

/**
 * Selector visual: una fila/grilla de botones tappables en vez de un
 * <select>. Un solo valor seleccionado a la vez. Se usa igual para
 * proyectos, segmentos, proveedores y para el menú de "qué agregás".
 */
export function ChipPicker({
  options,
  value,
  onChange,
  ariaLabel,
  columns,
  size = "md",
}: {
  options: ChipOption[];
  value: string | null;
  onChange: (id: string) => void;
  ariaLabel: string;
  /** Si se define, fuerza una grilla de N columnas en vez del wrap. */
  columns?: number;
  size?: "sm" | "md";
}) {
  return (
    <div
      className={`chip-picker chip-picker-${size}`}
      role="radiogroup"
      aria-label={ariaLabel}
      style={
        columns
          ? { gridTemplateColumns: `repeat(${columns}, 1fr)`, display: "grid" }
          : undefined
      }
    >
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={selected}
            className="chip-pick"
            data-selected={selected}
            disabled={o.disabled}
            onClick={() => onChange(o.id)}
          >
            <span className="chip-pick-label">{o.label}</span>
            {o.sublabel ? (
              <span className="chip-pick-sub">{o.sublabel}</span>
            ) : null}
            {o.tag ? <span className="chip-pick-tag">{o.tag}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
