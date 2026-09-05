"use client";

import { classStatuses, type ClassStatus } from "@/lib/schedule-shared";

export function ClassStatusButtons({ value, onChange }: { value: ClassStatus; onChange: (value: ClassStatus) => void }) {
  return <div className="class-status-buttons" role="group" aria-label="Class status">
    {classStatuses.map((status) => <button key={status} type="button" aria-pressed={value === status} className={`class-status-button class-status-${status.toLowerCase()}${value === status ? " is-selected" : ""}`} onClick={() => onChange(status)}>{value === status && <span aria-hidden="true">✓</span>}{status}</button>)}
    <input type="hidden" name="status" value={value} />
  </div>;
}
