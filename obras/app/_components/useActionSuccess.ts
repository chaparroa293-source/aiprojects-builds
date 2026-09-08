"use client";

import { useEffect, useRef } from "react";

/**
 * Corre `onSuccess` una sola vez por cada resultado exitoso de un
 * server action usado con useActionState.
 *
 * Va en un efecto a propósito: cerrar el popup o refrescar la ruta son
 * efectos secundarios, y hacerlos durante el render dispara el clásico
 * "Cannot update a component while rendering a different component".
 */
export function useActionSuccess<T extends { error: string | null }>(
  state: T,
  onSuccess: () => void,
) {
  const seen = useRef(state);
  const cb = useRef(onSuccess);

  useEffect(() => {
    cb.current = onSuccess;
  });

  useEffect(() => {
    if (seen.current === state) return;
    seen.current = state;
    if (state.error === null) cb.current();
  }, [state]);
}
