import type { ClassStatus } from "@/lib/schedule-shared";

export function ClassStatusChip({ status, needsOutcome = false }: { status: ClassStatus; needsOutcome?: boolean }) {
  const unresolved = status === "Scheduled" && needsOutcome;
  return <span className={`status-chip class-status-${unresolved ? "needs-outcome" : status.toLowerCase()}`} aria-label={unresolved ? "Class status: Scheduled; needs outcome" : undefined}>{unresolved ? "Scheduled · Needs outcome" : status}</span>;
}
