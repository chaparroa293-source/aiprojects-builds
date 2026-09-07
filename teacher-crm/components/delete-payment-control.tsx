"use client";

import { deletePayment } from "@/app/(protected)/payments/actions";
import { ConfirmDestructiveAction } from "@/components/confirm-destructive-action";

export function DeletePaymentControl({ id, returnTo }: { id: string; returnTo: string }) {
  return <ConfirmDestructiveAction actionLabel="Delete payment" confirmText="Delete this payment? Classes and Client will remain. This cannot be undone." pendingText="Deleting…" onConfirm={() => deletePayment(id, returnTo)} />;
}
