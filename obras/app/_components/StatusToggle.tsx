"use client";

import type { ProjectStatus } from "@prisma/client";

export function StatusToggle({
  status,
  onToggle,
}: {
  status: ProjectStatus;
  onToggle: () => Promise<void>;
}) {
  const finished = status === "FINISHED";
  return (
    <form action={onToggle}>
      <button type="submit" className="btn">
        {finished ? "Reabrir proyecto (marcar activo)" : "Marcar como terminado"}
      </button>
    </form>
  );
}
