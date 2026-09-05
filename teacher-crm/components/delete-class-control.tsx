"use client";

import { useState, useTransition } from "react";
import { deleteClassRecord } from "@/app/(protected)/schedule/actions";

export function DeleteClassControl({ id, returnTo, compact = false }: { id: string; returnTo: string; compact?: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return <div className={`delete-class-area${compact ? " delete-class-compact" : ""}`}>
    {!confirming ? <button type="button" className="button button-danger" onClick={() => setConfirming(true)}>Delete class</button> : <div role="group" aria-label="Confirm class deletion" className="delete-confirmation">
      <p>Delete this class? This cannot be undone.</p>
      <button type="button" className="button button-secondary" disabled={pending} onClick={() => setConfirming(false)}>Keep class</button>
      <button type="button" className="button button-danger" disabled={pending} onClick={() => {
        setError("");
        startTransition(async () => {
          const data = new FormData(); data.set("returnTo", returnTo);
          const result = await deleteClassRecord(id, data);
          if (result?.error) setError(result.error);
        });
      }}>{pending ? "Deleting…" : "Confirm delete"}</button>
    </div>}
    {error && <p role="alert" className="form-error">{error}</p>}
  </div>;
}
