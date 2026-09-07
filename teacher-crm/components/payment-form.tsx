"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ClientSelector } from "@/components/client-selector";
import { NewClientInline } from "@/components/new-client-inline";
import { GuaraniInput } from "@/components/guarani-input";
import { DeletePaymentControl } from "@/components/delete-payment-control";
import { DrawerBackLink } from "@/components/drawer-back-link";
import { savePayment } from "@/app/(protected)/payments/actions";
import { formatDate, formatTime, todayInProductTimezone, type ClientOption } from "@/lib/schedule-shared";
import type { Payment } from "@/lib/payments";

type ClassOption = { id: string; client_id: string; class_date: string; start_time: string; status: string; class_topic: string | null; payment_id: string | null };
export function PaymentForm({ clients, classes, payment, initialClientId = "", returnTo }: {
  clients: ClientOption[]; classes: ClassOption[]; payment?: Payment; initialClientId?: string; returnTo: string;
}) {
  const [clientId, setClientId] = useState(payment?.client_id ?? initialClientId);
  const [clientOptions, setClientOptions] = useState(clients);
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [selected, setSelected] = useState(payment ? classes.filter((item) => item.payment_id === payment.id).map((item) => item.id) : []);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const available = classes.filter((item) => item.client_id === clientId && (!item.payment_id || item.payment_id === payment?.id));
  return <section className="form-page payment-form-page">
    <div className="drawer-topline"><DrawerBackLink href={returnTo} destination={returnTo === "/home" ? "Home" : returnTo === "/dashboard" ? "Dashboard" : returnTo.startsWith("/schedule") ? "Schedule" : returnTo.startsWith("/clients/") ? "Client" : "Payments"} /></div>
    <div className="page-heading compact-heading"><div><p className="eyebrow">Payments</p><h1>{payment ? "Edit payment" : "Record payment"}</h1><p>Record money received and optionally link classes.</p></div></div>
    <form className="client-form" action={(form) => { setError(""); startTransition(async () => { const result = await savePayment(payment?.id ?? null, form); if (result?.error) setError(result.error); }); }}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <fieldset disabled={pending}><div className="form-grid">
        <div className="student-paths field-wide"><button type="button" className={clientMode === "existing" ? "student-path-active" : ""} onClick={() => setClientMode("existing")}>Select existing student</button><button type="button" className={clientMode === "new" ? "student-path-active" : ""} onClick={() => setClientMode("new")}>Create new student</button></div>
        {clientMode === "existing" ? <ClientSelector clients={clientOptions} value={clientId} onChange={(id) => { if (id !== clientId) setSelected([]); setClientId(id); }} /> : <NewClientInline onChooseExisting={() => setClientMode("existing")} onCreated={(client) => { setClientOptions((current) => [...current, client].sort((a, b) => a.student_name.localeCompare(b.student_name))); setSelected([]); setClientId(client.id); setClientMode("existing"); }} />}
        <GuaraniInput initialValue={payment?.amount} />
        <label>Payment Date<input name="payment_date" type="date" required defaultValue={payment?.payment_date ?? todayInProductTimezone()} /></label>
      </div></fieldset>
      <fieldset disabled={pending}><legend>Classes covered (optional)</legend>
        <p className="field-hint">Any status may be selected. Classes linked to another payment are excluded.</p>
        {!clientId ? <p>Choose a Client to see classes.</p> : !available.length ? <p>No available classes. You can save without linking classes.</p> : <div className="payment-class-options">{available.map((item) => <div className="payment-class-option" key={item.id}><label>
          <input type="checkbox" name="class_ids" value={item.id} checked={selected.includes(item.id)} onChange={(event) => setSelected((ids) => event.target.checked ? [...ids, item.id] : ids.filter((id) => id !== item.id))} />
          <span><strong>{formatDate(item.class_date, { year: "numeric" })} · {formatTime(item.start_time)}</strong><small>{item.status}{item.class_topic ? ` · ${item.class_topic}` : ""}</small></span>
        </label><Link className="button button-secondary compact-button" href={`/schedule/classes/${item.id}/edit?returnTo=${encodeURIComponent("/schedule")}`} target="_blank" rel="noreferrer">Open class <span aria-hidden="true">↗</span></Link></div>)}</div>}
      </fieldset>
      <fieldset disabled={pending}><label>Notes<textarea name="notes" rows={4} defaultValue={payment?.notes ?? ""} /></label></fieldset>
      {error && <p role="alert" className="form-error">{error}</p>}
      <div className="form-actions"><Link className="button button-secondary" href={returnTo}>Cancel</Link><button className="button button-primary" disabled={pending || !clientId}>{pending ? "Saving…" : "Save payment"}</button></div>
      {payment && <div className="form-destructive-area"><DeletePaymentControl id={payment.id} returnTo={returnTo} /></div>}
    </form>
  </section>;
}
