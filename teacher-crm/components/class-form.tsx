"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { createClassRecord, updateClassRecord } from "@/app/(protected)/schedule/actions";
import { ClientSelector } from "@/components/client-selector";
import { ClassStatusButtons } from "@/components/class-status-buttons";
import { DeleteClassControl } from "@/components/delete-class-control";
import { NewClientInline } from "@/components/new-client-inline";
import { SaveClassButton } from "@/components/save-class-button";
import { dateForWeekdayOnOrAfter, formatTime, todayInProductTimezone, validDate, weekdayLabel, type ClientOption, type RegularScheduleSlot, type TutoringClass } from "@/lib/schedule-shared";

type Props = {
  clients: ClientOption[];
  slots: RegularScheduleSlot[];
  tutoringClass?: TutoringClass;
  initialClientId?: string;
  initialDate?: string;
  returnTo: string;
};

export function ClassForm({ clients, slots, tutoringClass, initialClientId, initialDate, returnTo }: Props) {
  const action = tutoringClass ? updateClassRecord.bind(null, tutoringClass.id) : createClassRecord;
  const [clientOptions, setClientOptions] = useState(clients);
  const [clientId, setClientId] = useState(tutoringClass?.client_id ?? initialClientId ?? "");
  const [studentMode, setStudentMode] = useState<"existing" | "new">("existing");
  const [date, setDate] = useState(tutoringClass?.class_date ?? initialDate ?? todayInProductTimezone());
  const [startTime, setStartTime] = useState(tutoringClass ? formatTime(tutoringClass.start_time) : "");
  const [duration, setDuration] = useState(tutoringClass?.duration_minutes ? String(tutoringClass.duration_minutes) : "");
  const [status, setStatus] = useState(tutoringClass?.status ?? "Scheduled");
  const availableSlots = useMemo(() => slots.filter((slot) => slot.client_id === clientId), [clientId, slots]);
  const hours = Math.floor(Number(duration) / 60);
  const minutes = Number(duration) % 60;
  const standardDuration = hours <= 5 && [0, 15, 30, 45].includes(minutes);
  const timeMinute = startTime ? Number(startTime.slice(3, 5)) : 0;
  const timeStep = tutoringClass && startTime && timeMinute % 10 !== 0 ? "any" : "600";

  function applySlot(slot: RegularScheduleSlot) {
    setDate(dateForWeekdayOnOrAfter(validDate(date) ? date : todayInProductTimezone(), slot.weekday));
    setStartTime(formatTime(slot.start_time));
    setDuration(String(slot.duration_minutes));
  }

  return (
    <section className="form-page" aria-labelledby="class-form-title">
      {tutoringClass && <Link className="back-link form-back" href={returnTo}>‹ {returnTo.startsWith("/clients/") ? "Back to client" : "Back to Schedule"}</Link>}
      <div className="page-heading compact-heading"><div><p className="eyebrow">Schedule</p><h1 id="class-form-title">{tutoringClass ? "Edit class" : "Add class"}</h1><p>Times are shown in America/Asuncion.</p></div></div>
      <form action={action} className="client-form">
        <input type="hidden" name="returnTo" value={returnTo} />
        <fieldset aria-label="Class details"><div className="form-grid">
          {!tutoringClass && <div className="student-paths field-wide"><button type="button" className={studentMode === "existing" ? "student-path-active" : ""} onClick={() => setStudentMode("existing")}>Select existing student</button><button type="button" className={studentMode === "new" ? "student-path-active" : ""} onClick={() => setStudentMode("new")}>Create new student</button></div>}
          {studentMode === "existing" || tutoringClass ? <ClientSelector clients={clientOptions} value={clientId} onChange={setClientId} /> : <NewClientInline onChooseExisting={() => setStudentMode("existing")} onCreated={(client) => { setClientOptions((current) => [...current, client].sort((a, b) => a.student_name.localeCompare(b.student_name))); setClientId(client.id); setStudentMode("existing"); }} />}
          {!tutoringClass && availableSlots.length > 0 && <div className="field-wide quick-defaults"><span>Regular schedule defaults</span><div>{availableSlots.map((slot) => <button className="quick-default" type="button" onClick={() => applySlot(slot)} key={slot.id}>{weekdayLabel(slot.weekday)} · {formatTime(slot.start_time)} · {slot.duration_minutes} min</button>)}</div></div>}
          <label>Date <span className="required">Required</span><input type="date" name="class_date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
          <label>Start Time <span className="required">Required</span><input type="time" name="start_time" step={timeStep} value={startTime} onChange={(event) => setStartTime(event.target.value)} required /></label>
          <div className="duration-field"><span className="field-label">Duration</span><input type="hidden" name="duration_minutes" value={duration} /><div className="duration-controls">
            <label>Hours<select value={hours} onChange={(event) => setDuration(String(Number(event.target.value) * 60 + minutes))}>{[0, 1, 2, 3, 4, 5].map((hour) => <option key={hour} value={hour}>{hour}</option>)}{hours > 5 && <option value={hours}>{hours} (existing)</option>}</select></label>
            <label>Minutes<select value={minutes} onChange={(event) => setDuration(String(hours * 60 + Number(event.target.value)))}>{[0, 15, 30, 45].map((minute) => <option key={minute} value={minute}>{String(minute).padStart(2, "0")}</option>)}{![0, 15, 30, 45].includes(minutes) && <option value={minutes}>{minutes} (existing)</option>}</select></label>
          </div>{!standardDuration && <small className="field-hint">Existing duration preserved. Choose a new duration to change it.</small>}{Number(duration) === 0 && <small className="field-hint">Choose a duration greater than zero.</small>}</div>
          <div className="field-wide"><span className="field-label">Class status</span><ClassStatusButtons value={status} onChange={setStatus} /></div>
        </div></fieldset>
        <fieldset><div className="form-grid"><label className="field-wide">Class name / topic<input name="class_topic" placeholder="For example, Math review" defaultValue={tutoringClass?.class_topic ?? ""} /></label><label className="field-wide">Notes<textarea name="notes" rows={4} defaultValue={tutoringClass?.notes ?? ""} /></label></div></fieldset>
        <div className="form-actions"><Link className="button button-secondary" href={returnTo}>Cancel</Link><SaveClassButton disabled={!clientId || Number(duration) <= 0} /></div>
      </form>
      {tutoringClass && <DeleteClassControl id={tutoringClass.id} returnTo={returnTo} />}
    </section>
  );
}
