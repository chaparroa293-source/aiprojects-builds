"use client";

import { statuses, type ClientStatus } from "@/lib/client-status";

export function ClientStatusButtons({ value, onChange }: { value: ClientStatus; onChange: (value: ClientStatus) => void }) {
  return <div className="class-status-buttons" role="group" aria-label="Client status">
    {statuses.map((status) => <button key={status} type="button" aria-pressed={value === status} className={`class-status-button client-status-${status.toLowerCase()}${value === status ? " is-selected" : ""}`} onClick={() => onChange(status)}>{value === status && <span aria-hidden="true">✓</span>}{status}</button>)}
    <input type="hidden" name="status" value={value} />
  </div>;
}
