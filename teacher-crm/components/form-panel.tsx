"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function FormPanel({ returnTo, label, children }: { returnTo: string; label: string; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const discardDialog = useRef<HTMLDialogElement>(null);
  const keepEditing = useRef<HTMLButtonElement>(null);
  const dirty = useRef(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const router = useRouter();
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useEffect(() => {
    const element = discardDialog.current;
    if (confirmingDiscard) {
      element?.showModal();
      keepEditing.current?.focus();
    } else element?.close();
    return () => element?.close();
  }, [confirmingDiscard]);
  function close() {
    if (dirty.current) setConfirmingDiscard(true);
    else router.push(returnTo, { scroll: false });
  }
  return <><dialog ref={dialog} className="form-panel" aria-label={label}
    onChangeCapture={() => { dirty.current = true; }}
    onCancel={(event) => { event.preventDefault(); close(); }}
    onClickCapture={(event) => {
      if ((event.target as HTMLElement).closest("button")) dirty.current = true;
      const link = (event.target as HTMLElement).closest("a");
      if (!link || `${link.pathname}${link.search}` !== returnTo || !dirty.current) return;
      event.preventDefault();
      setConfirmingDiscard(true);
    }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close();
    }}>{children}</dialog><dialog ref={discardDialog} className="discard-confirmation" aria-labelledby="discard-title" aria-describedby="discard-description"
      onCancel={(event) => { event.preventDefault(); setConfirmingDiscard(false); }}>
      <div><h2 id="discard-title">Discard changes?</h2><p id="discard-description">Your unsaved changes will be lost.</p></div>
      <div><button ref={keepEditing} className="button button-secondary" type="button" onClick={() => setConfirmingDiscard(false)}>Keep editing</button><button className="button button-danger" type="button" onClick={() => router.push(returnTo, { scroll: false })}>Discard changes</button></div>
    </dialog></>;
}
