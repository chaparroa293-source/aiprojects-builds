"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { DirectoryRecord, FormState } from "@/lib/directory-actions";
import { Popup } from "./Popup";
import { DirectoryQuickForm } from "./DirectoryQuickForm";

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Alta y edición de un registro del directorio. Mismo popup en los dos
 * casos y en los tres directorios: "agregar X" se ve y se comporta
 * igual en toda la app. El formulario en sí es DirectoryQuickForm,
 * compartido con UniversalAdd.
 */
export function DirectoryFormPopup({
  action,
  title,
  submitLabel,
  triggerLabel,
  triggerClassName = "btn btn-primary",
  record,
}: {
  action: Action;
  title: string;
  submitLabel: string;
  triggerLabel: string;
  triggerClassName?: string;
  record?: DirectoryRecord;
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
        <Popup title={title} onClose={() => setOpen(false)} width={420}>
          <DirectoryQuickForm
            action={action}
            submitLabel={submitLabel}
            record={record}
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
