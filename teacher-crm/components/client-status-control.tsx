"use client";

import { useState, useTransition } from "react";
import { updateClientStatus } from "@/app/(protected)/clients/actions";
import { statuses, type ClientStatus } from "@/lib/client-status";

export function ClientStatusControl({ id, status, returnTo }: { id: string; status: ClientStatus; returnTo: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return <div className="status-control">
    <select aria-label="Client status" className={`status-${status.toLowerCase()}`} value={status} disabled={pending} onChange={(event) => {
      const data = new FormData();
      data.set("status", event.target.value);
      data.set("returnTo", returnTo);
      setError("");
      startTransition(async () => {
        try { await updateClientStatus(id, data); } catch (failure) {
          if (failure instanceof Error && failure.message === "NEXT_REDIRECT") throw failure;
          setError("Status could not be saved. Please try again.");
        }
      });
    }}>{statuses.map((value) => <option value={value} key={value}>{value}</option>)}</select>
    {error && <p role="alert" className="form-error">{error}</p>}
  </div>;
}
