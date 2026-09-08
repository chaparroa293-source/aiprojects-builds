"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Popup } from "./Popup";
import { ExpenseQuickForm } from "./ExpenseQuickForm";

/**
 * Botón + popup de alta rápida de gastos, usado DENTRO de un proyecto
 * ("+ Registrar gasto", con el proyecto fijo). El alta global vive en
 * UniversalAdd, que reutiliza el mismo ExpenseQuickForm.
 */
export function QuickAddExpense({
  lockedProjectId,
  triggerLabel = "+ Registrar gasto",
  triggerClassName = "btn btn-primary",
}: {
  lockedProjectId?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const loggedSomething = useRef(false);

  function close() {
    setOpen(false);
    if (loggedSomething.current) {
      loggedSomething.current = false;
      router.refresh();
    }
  }

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => {
          loggedSomething.current = false;
          setOpen(true);
        }}
      >
        {triggerLabel}
      </button>

      {open ? (
        <Popup
          title="Registrar gasto"
          subtitle="Segmento → monto. El resto es opcional."
          onClose={close}
          width={480}
        >
          <ExpenseQuickForm
            lockedProjectId={lockedProjectId}
            onLogged={() => {
              loggedSomething.current = true;
            }}
          />
        </Popup>
      ) : null}
    </>
  );
}
