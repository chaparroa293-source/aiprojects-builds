import Link from "next/link";

import { createClientRecord, updateClientRecord } from "@/app/(protected)/clients/actions";
import { statuses } from "@/lib/client-status";
import type { Client } from "@/lib/clients";

type Props = { client?: Client; returnTo: string };

export function ClientForm({ client, returnTo }: Props) {
  const action = client ? updateClientRecord.bind(null, client.id) : createClientRecord;
  const title = client ? "Edit client" : "Add client";

  return (
    <section className="form-page" aria-labelledby="client-form-title">
      <div className="page-heading compact-heading">
        <div>
          <p className="eyebrow">Clients</p>
          <h1 id="client-form-title">{title}</h1>
          <p>{client ? "Update the student and contact information." : "Add a student and their tutoring relationship."}</p>
        </div>
      </div>
      <form action={action} className="client-form">
        <input type="hidden" name="returnTo" value={returnTo} />
        <fieldset>
          <legend>Identity</legend>
          <div className="form-grid">
            <label className="field-wide">
              Student Name <span className="required">Required</span>
              <input name="student_name" defaultValue={client?.student_name} required autoFocus />
            </label>
            <label>
              Status
              <select name="status" defaultValue={client?.status ?? "Prospect"}>
                {statuses.map((status) => <option value={status} key={status}>{status}</option>)}
              </select>
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Student information</legend>
          <div className="form-grid">
            <label>
              School
              <input name="school" defaultValue={client?.school ?? ""} />
            </label>
            <label>
              Grade / Year
              <input name="grade_year" defaultValue={client?.grade_year ?? ""} />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Contact information</legend>
          <div className="form-grid">
            <label>
              Payer / Contact Name
              <input name="payer_contact_name" defaultValue={client?.payer_contact_name ?? ""} />
            </label>
            <label>
              Relationship to Student
              <input name="relationship_to_student" defaultValue={client?.relationship_to_student ?? ""} />
            </label>
            <label>
              Phone / WhatsApp
              <input name="phone_whatsapp" defaultValue={client?.phone_whatsapp ?? ""} inputMode="tel" />
            </label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Notes</legend>
          <label>
            Notes
            <textarea name="notes" rows={5} defaultValue={client?.notes ?? ""} />
          </label>
        </fieldset>
        <div className="form-actions">
          <Link className="button button-secondary" href={returnTo}>Cancel</Link>
          <button className="button button-primary" type="submit">Save client</button>
        </div>
      </form>
    </section>
  );
}
