"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function ClientDetailPanel({ returnTo, children }: { returnTo: string; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={dialog} className="client-detail-panel" aria-labelledby="client-name"
    onCancel={(event) => { event.preventDefault(); router.push(returnTo, { scroll: false }); }}
    onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) router.push(returnTo, { scroll: false });
    }}>{children}</dialog>;
}
