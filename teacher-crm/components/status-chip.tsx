import type { ClientStatus } from "@/lib/client-status";

export function StatusChip({ status }: { status: ClientStatus }) {
  return <span className={`status-chip status-${status.toLowerCase()}`}>{status}</span>;
}
