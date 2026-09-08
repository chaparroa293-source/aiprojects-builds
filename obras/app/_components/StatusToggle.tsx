"use client";

import { useRouter } from "next/navigation";
import type { ProjectStatus } from "@prisma/client";

export function StatusToggle({
  status,
  onToggle,
}: {
  status: ProjectStatus;
  onToggle: () => Promise<void>;
}) {
  const router = useRouter();
  const finished = status === "FINISHED";

  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        await onToggle();
        router.refresh();
      }}
    >
      {finished ? "Reabrir" : "Marcar terminado"}
    </button>
  );
}
