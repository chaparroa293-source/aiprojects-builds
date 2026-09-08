"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ClientOption, FormState } from "@/lib/project-actions";
import { Popup } from "./Popup";
import { ProjectQuickForm } from "./ProjectQuickForm";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

export function ProjectFormPopup({
  action,
  clients,
  mode,
  triggerLabel,
  triggerClassName = "btn btn-primary",
  defaults,
}: {
  action: Action;
  clients: ClientOption[];
  mode: "create" | "edit";
  triggerLabel: string;
  triggerClassName?: string;
  defaults?: {
    name: string;
    clientId: string | null;
    agreedTotalPrice: number;
    status: "ACTIVE" | "FINISHED";
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </button>

      {open ? (
        <Popup
          title={mode === "create" ? "Nuevo proyecto" : "Editar proyecto"}
          onClose={() => setOpen(false)}
          width={440}
        >
          <ProjectQuickForm
            action={action}
            clients={clients}
            mode={mode}
            defaults={defaults}
            onCancel={() => setOpen(false)}
            onSaved={() => {
              setOpen(false);
              router.refresh();
            }}
          />
        </Popup>
      ) : null}
    </>
  );
}
