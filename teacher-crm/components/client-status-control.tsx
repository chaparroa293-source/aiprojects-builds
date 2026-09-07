"use client";

import { useState, useTransition } from "react";
import { updateClientStatus } from "@/app/(protected)/clients/actions";
import type { ClientStatus } from "@/lib/client-status";
import { ClientStatusButtons } from "@/components/client-status-buttons";

export function ClientStatusControl({ id, status, returnTo }: { id: string; status: ClientStatus; returnTo: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return <div className="status-control">
    <fieldset disabled={pending}><ClientStatusButtons value={status} onChange={(value) => {
      const data = new FormData();
      data.set("status", value);
      data.set("returnTo", returnTo);
      setError("");
      startTransition(async () => {
        try { await updateClientStatus(id, data); } catch (failure) {
          if (failure instanceof Error && failure.message === "NEXT_REDIRECT") throw failure;
          setError("Status could not be saved. Please try again.");
        }
      });
    }} /></fieldset>
    {error && <p role="alert" className="form-error">{error}</p>}
  </div>;
}
