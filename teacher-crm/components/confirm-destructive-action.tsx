"use client";

import { useEffect, useRef, useState, useTransition } from "react";

export function ConfirmDestructiveAction({ actionLabel, compactLabel, confirmText, pendingText, onConfirm }: {
  actionLabel: string; compactLabel?: string; confirmText: string; pendingText: string;
  onConfirm: () => Promise<{ error?: string } | void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const area = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!confirming) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !area.current?.contains(event.target as Node)) setConfirming(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, [confirming]);
  return <div ref={area} className={`delete-class-area${compactLabel ? " delete-class-compact" : ""}`}>
    {!confirming ? <button type="button" disabled={pending} className={compactLabel ? "class-remove-button" : "button button-danger"} aria-label={compactLabel} title={compactLabel} onClick={() => setConfirming(true)}>{compactLabel ? "−" : actionLabel}</button> : <div role="group" aria-label={`Confirm ${actionLabel.toLowerCase()}`} className="delete-confirmation">
      <p>{confirmText}</p>
      <button type="button" className="button button-secondary" disabled={pending} onClick={() => setConfirming(false)}>Keep</button>
      <button type="button" className="button button-danger" disabled={pending} onClick={() => { setError(""); startTransition(async () => { const result = await onConfirm(); if (result?.error) setError(result.error); }); }}>{pending ? pendingText : `Confirm ${actionLabel.toLowerCase()}`}</button>
    </div>}
    {error && <p role="alert" className="form-error">{error}</p>}
  </div>;
}
