"use client";

import { useRef, useState, useTransition } from "react";

import { createClientInline } from "@/app/(protected)/clients/actions";
import { statuses } from "@/lib/client-status";
import type { ClientOption } from "@/lib/schedule-shared";

export function NewClientInline({ onCreated, onChooseExisting }: { onCreated: (client: ClientOption) => void; onChooseExisting: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const nameInput = useRef<HTMLInputElement>(null);
  const statusInput = useRef<HTMLSelectElement>(null);
  return <section className="new-client-inline" aria-labelledby="new-client-title">
    <div className="inline-path-heading"><div><h2 id="new-client-title">Create new student</h2><p>Create the student here, then continue setting up the class.</p></div><button type="button" className="text-button" onClick={onChooseExisting}>Select existing student</button></div>
    <div className="form-grid">
      <label className="field-wide">Student Name <span className="required">Required</span><input ref={nameInput} autoFocus /></label>
      <label>Status<select ref={statusInput} defaultValue="Prospect">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="button button-secondary" type="button" disabled={pending} onClick={() => {
      const name = nameInput.current?.value.trim() ?? "";
      const status = statusInput.current?.value ?? "Prospect";
      if (!name) { setError("Student Name is required."); return; }
      startTransition(async () => {
        try {
          const data = new FormData(); data.set("student_name", name); data.set("status", status);
          const client = await createClientInline(data);
          onCreated(client);
        } catch (failure) { setError(failure instanceof Error ? failure.message : "Student could not be created."); }
      });
    }}>{pending ? "Creating…" : "Create student and continue"}</button>
  </section>;
}
