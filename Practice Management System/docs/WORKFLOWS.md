# Workflows

## Client Directory — Slice 1

Create client → persist client → see client in directory → open client → view stored information → edit client → save changes → verify persistence after reload.

The React interface is implemented in Spanish. With fake development data, the complete workflow is verified against `practice_management.clients`: create → directory read → detail → edit → reload → persisted values. Authentication and production RLS remain deferred.

## Session history — Slice 2

Open client → open Sesiones → see that client's history → add session → persist → open stored session → edit → save → reload → persisted values remain.

The current client is inherited by the session form. `fecha`, `hora_inicio`, and `estado` are required; `duracion_minutos` and `notas` are optional. Fake development verification covered empty history, a session without duration, all allowed states, direct database read, edit, and reload. The fake client and session were removed afterward.

## Client Agenda — Slice 3A

Open client → open Agenda → see that client's empty Agenda → add appointment → persist → open stored appointment → edit → save → reload → persisted values remain.

The current client is inherited by the appointment form and cannot be reassigned there. `fecha` and `hora_inicio` are required; `duracion_minutos` and `notas` are optional; the only states are `programada` and `cancelada`. Fake development verification covered empty Agenda, create, edit, reload, direct ownership/NULL checks, UI validation, and database rejection of an unsupported state. The fake client and appointment were removed afterward. Appointment → Session conversion is not implemented.

## Calendar v1 — PMS-CAL-002

Open Calendario → see the week containing today → navigate Anterior/Hoy/Siguiente → create an Appointment for a selected Client or a specific day → persist → open/edit/reschedule/cancel → reload the same URL-backed week → values remain consistent with Client Detail → Agenda.

The Calendar reads the inclusive Monday–Sunday date range across Clients and uses the existing Appointment create/update operations and validation. Wider layouts use seven day columns; tablet and phone layouts group the days vertically without horizontal grid scrolling. Cancelled Appointments remain visible and labelled. Editing keeps Client ownership locked. There is no new stored object, schema change, timezone conversion, recurrence, drag-and-drop, availability engine, reminder, or external calendar integration.

Calendar ↔ Agenda navigation (PMS-UX-002): the per-Appointment "Ver en calendario" opens that Appointment's own week. The Agenda-level "Ver en calendario" opens the week of the Client's nearest upcoming Appointment; if none are upcoming it uses the most recent past Appointment; if the Agenda is empty it falls back to the current week. Calendar and Client Agenda now share a single Appointment persistence helper (`persistAppointment`) rather than two hand-written write paths. Appointment create/edit — from either the Calendar or the Client Agenda — and Client add/edit open in a right-side drawer that keeps the underlying workspace visible; Sessions, Payments, and Quick Capture are unchanged.

PMS-UX-003 refinements: the per-day "Agregar cita" is a real dashed button (min 36px) that opens the day-prefilled Appointment drawer; when no Client exists the Calendar shows a single `Agregar cliente` path instead of disabled-looking day actions. Quick Capture gains a contextual `＋ Nuevo cliente` that opens the Client drawer over the still-open capture and auto-selects the created Client while preserving entered values. Client Detail phone/email are `tel:` / `wa.me` / `mailto:` links (URL normalisation only; stored value unchanged). Directory sorting moved to `Cliente`/`Estado` column headers (the `Ordenar` dropdown and its recency option were removed). The sidebar has an explicit `☰` collapse control. A restrained amber/teal/lavender/coral supporting palette differentiates status and modules on small elements only.

PMS-UX-004 refinements: `duracion_minutos` is edited through `DurationField` (preset pills 30/45/60/90 + free manual entry, no coercion) in the Appointment, Session, and Quick Capture forms. Estado carries semantic colour with its label everywhere — table/card chips, Client Detail chip, and a coloured left accent on each form's Estado `<select>`. On a Session that references a Payment, `Pago registrado →` navigates to that Client's Pagos tab and reveals the exact linked Payment (outline + scroll); it degrades to plain text when the Payment is not loaded. Client Directory phone/email cells are now `tel:` / `mailto:` links (no row chips). Deletion was audited across all four objects and remains unsupported and unimplemented — the database grants no `DELETE`, there is no delete API, and its per-object semantics are an open product decision (`TECHNICAL_SPEC.md` DEFERRED → Deletion).

## Client Payments — Slice 4

Open client → open Pagos → see that client's empty state → add payment → persist → open stored payment → edit → save → reload → persisted values remain.

The current client is inherited by the payment form and cannot be reassigned. `fecha` and a positive whole-guaraní `monto` are required; `notas` is optional and blank notes persist as `NULL`. Total received is the sum of payments for the current Client only; it is not a balance, debt, invoice, or earned revenue. Fake development verification covered empty state, create, direct ownership/NULL checks, edit, reload, validation, and the total. The fake records were removed afterward. Global Payments is not implemented.

## Quick Capture — Slice 5

The persistent shell action opens a compact Session or Payment form. It requires an explicit Client selection (or visibly uses the current Client), then calls the same normal Session or Payment create operation. Quick Session records start with `payment_id = NULL`; Quick Payment records remain ordinary payments and update the existing Client Detail total. There is no Quick Capture table, history, or duplicate storage; Client Detail → Sesiones and Pagos remain the only retrieval paths. A contextual `＋ Nuevo cliente` beside the Client selector opens the standard Client create drawer without leaving Quick Capture; on save the new Client is auto-selected and the in-progress Session/Payment values are kept. This is an escape hatch from the selector — Client remains its own object and is created through the normal Client create path.
