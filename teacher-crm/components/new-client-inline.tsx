"use client";

import { useRef, useState, useTransition } from "react";

import { createClientInline } from "@/app/(protected)/clients/actions";
import { ClientStatusButtons } from "@/components/client-status-buttons";
import type { ClientStatus } from "@/lib/client-status";
import type { ClientOption } from "@/lib/schedule-shared";

export function NewClientInline({ onCreated, onChooseExisting }: { onCreated: (client: ClientOption) => void; onChooseExisting: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ClientStatus>("Prospect");
  return <section className="new-client-inline" aria-labelledby="new-client-title">
    <div className="inline-path-heading"><div><h2 id="new-client-title">Create new student</h2><p>Create the student here, then continue with this form.</p></div><button type="button" className="text-button" onClick={onChooseExisting}>Select existing student</button></div>
    <div className="form-grid">
      <label className="field-wide">Student Name <span className="required">Required</span><input ref={nameInput} autoFocus /></label>
      <div className="inline-client-action-row field-wide"><div><span className="field-label">Status</span><ClientStatusButtons value={status} onChange={setStatus} /></div>
      <button className="button button-primary" type="button" disabled={pending} onClick={() => {
        const name = nameInput.current?.value.trim() ?? "";
        if (!name) { setError("Student Name is required."); return; }
        startTransition(async () => {
          try {
            const data = new FormData(); data.set("student_name", name); data.set("status", status);
            const client = await createClientInline(data);
            onCreated(client);
          } catch (failure) { setError(failure instanceof Error ? failure.message : "Student could not be created."); }
        });
      }}>{pending ? "Creating…" : "Create student and continue"}</button></div>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>;
}
