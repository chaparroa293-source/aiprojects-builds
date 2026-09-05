import type { ClassStatus } from "@/lib/schedule-shared";

export function ClassStatusChip({ status }: { status: ClassStatus }) {
  return <span className={`status-chip class-status-${status.toLowerCase()}`}>{status}</span>;
}
