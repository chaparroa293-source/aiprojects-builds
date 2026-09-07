"use client";

import Link from "next/link";
import { useActionState } from "react";

import { createRegularScheduleSlot, updateRegularScheduleSlot } from "@/app/(protected)/schedule/actions";
import { formatTime, weekdays, type RegularScheduleSlot } from "@/lib/schedule-shared";
import { DrawerBackLink } from "@/components/drawer-back-link";

export function RegularScheduleForm({ clientId, slot, returnTo }: { clientId: string; slot?: RegularScheduleSlot; returnTo: string }) {
  const action = slot ? updateRegularScheduleSlot.bind(null, slot.id) : createRegularScheduleSlot;
  const [actionState, formAction, pending] = useActionState(action, { error: "" });
  return <section className="form-page" aria-labelledby="slot-form-title">
    <div className="drawer-topline"><DrawerBackLink href={returnTo} destination="client" /></div>
    <div className="page-heading compact-heading"><div><p className="eyebrow">Regular schedule</p><h1 id="slot-form-title">{slot ? "Edit regular time" : "Add regular time"}</h1><p>This is a reusable default, not a recurring class.</p></div></div>
    <form action={formAction} className="client-form">
      <input type="hidden" name="client_id" value={clientId} /><input type="hidden" name="returnTo" value={returnTo} />
      <fieldset><legend>Normal class time</legend><div className="form-grid">
        <label>Weekday<select name="weekday" defaultValue={slot?.weekday ?? 1}>{weekdays.map((day) => <option value={day.value} key={day.value}>{day.label}</option>)}</select></label>
        <label>Start Time <span className="required">Required</span><input type="time" name="start_time" defaultValue={slot ? formatTime(slot.start_time) : ""} required /></label>
        <label>Duration (minutes) <span className="required">Required</span><input type="number" name="duration_minutes" min="1" step="1" defaultValue={slot?.duration_minutes} required /></label>
      </div></fieldset>
      {actionState.error && <p className="form-error" role="alert">{actionState.error}</p>}
      <div className="form-actions"><Link className="button button-secondary" href={returnTo}>Cancel</Link><button className="button button-primary" type="submit" disabled={pending}>{pending ? "Saving…" : "Save regular time"}</button></div>
    </form>
  </section>;
}
