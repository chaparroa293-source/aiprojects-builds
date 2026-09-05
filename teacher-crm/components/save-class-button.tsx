"use client";

import { useFormStatus } from "react-dom";

export function SaveClassButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return <button className="button button-primary" type="submit" disabled={disabled || pending}>{pending ? "Saving…" : "Save class"}</button>;
}
