"use client";

import { removeRegularScheduleSlot } from "@/app/(protected)/schedule/actions";
import { ConfirmDestructiveAction } from "@/components/confirm-destructive-action";

export function RemoveRegularScheduleControl({ id, returnTo }: { id: string; returnTo: string }) {
  return <ConfirmDestructiveAction actionLabel="Remove time" compactLabel="Remove regular time" confirmText="Remove this regular time? Existing classes will remain." pendingText="Removing…" onConfirm={() => { const data = new FormData(); data.set("returnTo", returnTo); return removeRegularScheduleSlot(id, data); }} />;
}
