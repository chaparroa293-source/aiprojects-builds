"use client";

import { deleteClassRecord } from "@/app/(protected)/schedule/actions";
import { ConfirmDestructiveAction } from "@/components/confirm-destructive-action";

export function DeleteClassControl({ id, returnTo, compact = false }: { id: string; returnTo: string; compact?: boolean }) {
  return <ConfirmDestructiveAction actionLabel="Delete class" compactLabel={compact ? "Remove class" : undefined} confirmText="Delete this class? This cannot be undone." pendingText="Deleting…" onConfirm={() => { const data = new FormData(); data.set("returnTo", returnTo); return deleteClassRecord(id, data); }} />;
}
