# UX Contract — Directory, Calendar, Sessions, Agenda, and Payments

## Product context

- Audience: independent Paraguayan service professionals.
- Active locale: Spanish (`es-PY`); all owned UI and accessible labels are Spanish.
- Accessibility target: WCAG 2.2 AA baseline.
- Source: `docs/PRODUCT.md`, `docs/WORKFLOWS.md`, the Slice 1 request, and the tutor predecessor's stated visual grammar.

## Canonical UI map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Form | `ClientForm`, `SessionForm`, `AppointmentForm`, `PaymentForm`, and `QuickCapture` in `src/App.jsx` | This contract | Quick Capture is a compact create-only variant that writes the existing Session or Payment object. | Browser validation states. |
| Drawer | `Drawer` in `src/App.jsx` | `DESIGN.md` | Right-side create/edit panel over a light scrim; standard for Add/Edit Client and every Appointment create/edit (Calendar and Client Agenda). Sessions, Payments, and Quick Capture remain inline. | Open/close (`×`, Cancelar, scrim, Escape), first-field focus, ~440px / full-width ≤560px, workspace still visible behind. |
| Select/Listbox | Native `<select>` | This contract | Native only; accepted for small client/session status sets. | Keyboard and native popup. |
| Date | Native date/time inputs | This contract | Native only; accepted for the required session date/time fields. | Browser input and validation states. |
| Scrollbar | `src/styles.css` | `DESIGN.md` | Global baseline only. | Computed stylesheet inspection. |
| Toast | Inline `role=status` / `role=alert` in `App` | This contract | Success and error messages only. | Browser live-region inspection. |
| CRUD | `client-api.js` + `App` | `docs/WORKFLOWS.md` | Pessimistic client/session/appointment/payment create/edit; Calendar and Client Agenda share Appointment operations. | Full flow after Supabase setup. |
| Weekly Calendar | `Calendar` in `src/App.jsx` | This contract | Seven columns when wide; grouped Monday–Sunday sections when narrow. Per-day "Agregar cita" is a subordinate dashed button (min 36px), omitted entirely when no Client exists (a single `Agregar cliente` path replaces it and `Nueva cita`). | Navigation, responsive, persistence, Agenda consistency, and a real click on each enabled day-level action. |
| Nav collapse | `Sidebar` `☰` in `src/App.jsx` | `DESIGN.md` | Icon-only 64px rail on ≥821px; show/hide the wrapped nav strip on ≤820px. Persisted in `localStorage`; distinct from the drawer `×`. | Toggle at desktop / tablet-landscape / tablet-portrait / phone; auto-collapse after navigating on narrow. |
| Search/filter | `App` directory controls | This contract | Local, transient search + `Estado` filter until a server-side contract exists. | Browser interaction check. |
| Directory sort | `Cliente` / `Estado` column-header buttons in `App` | This contract | Header click toggles asc/desc with `aria-sort` + chevron; default `nombre` asc. Replaces the former `Ordenar` dropdown — recency sort is dropped. | Header click asc/descending; `aria-sort` only on the active column. |
| Contact links | `ClientDetail` (rich: value + `Llamar` + `WhatsApp`) and Client Directory rows (`tel:` / `mailto:` on the cell value only) in `src/App.jsx` | `DESIGN.md` | `wa.me` opens in a new tab; number normalised for the URL only, stored `telefono` unchanged. Links only — no sending, history, automation. | Inspect resolved `href`s in Detail and Directory; confirm stored value unchanged. |
| Duration | `DurationField` in `src/App.jsx` | `DESIGN.md` | Preset pills (30/45/60/90) above the free-entry number input; used by Appointment, Session, Quick Capture. Optional; no coercion; no closed dropdown. | Pick each preset, toggle a preset off, type a non-preset value, leave blank; confirm persisted `duracion_minutos`. |
| Session → Payment | `SessionHistory` `Pago registrado →` + `PaymentHistory` reveal in `src/App.jsx` | `DESIGN.md` | Switches to Pagos tab, selects + outlines + scrolls to the linked Payment. Plain muted text (no link) when the Payment is absent from the loaded set; inline notice on a stale click. | Open a linked Session, click, confirm the exact Payment row is revealed. |
| Practitioner identity | `practitioner` constant + `.account[data-placeholder]` | `DESIGN.md` | Styled placeholder only; shaped for a future authenticated profile. No auth/profile modelling in scope. | Visual; values are not product identity. |
| Deletion | — | `TECHNICAL_SPEC.md` DEFERRED → Deletion | Unsupported for every object. DB withholds `DELETE`; `client-api.js` has no delete function; no delete controls in the UI. | N/A — audited, deferred pending a product rule. |

## Flow ledger

| Operation | Pending | Success | Failure recovery |
| --- | --- | --- | --- |
| Create | Save button disabled with `Guardando…` | Detail view opens and directory updates | Preserve form values and show inline error. |
| Edit | Save button disabled with `Guardando…` | Updated detail view opens | Preserve form values and show inline error. |
| Load | Stable loading row | Directory list appears | Inline loading error explains the failed operation. |
| Cancel | None | Returns to detail/list without saving | None. |
| Demo create/edit | Save button disabled while applying | Visible during this browser session only | Message clearly states it was not persisted. |
| Session create | Save button disabled with `Guardando…` | History remains in the owning Client Detail and updates | Preserve form values and show inline error. |
| Session edit | Save button disabled with `Guardando…` | History remains in the owning Client Detail and updates | Preserve form values and show inline error. |
| Payment create/edit | Save button disabled with `Guardando…` | Pagos remains in the owning Client Detail and updates the client-only total | Preserve form values and show inline error. |
| Quick Session/Payment | Save button disabled with `Guardando…` | Inline confirmation; form resets for the next capture | Preserve values and show inline error. |
| Calendar load/navigation | Stable `Cargando calendario…` state | URL-backed Monday–Sunday week renders | Preserve selected week and show inline retry context. |
| Calendar Appointment create/edit | Save button disabled with `Guardando…` | Same week refreshes; moved records report their destination date | Preserve form values and show inline error. |
| Agenda → Calendar | None | Opens the week of the nearest upcoming Appointment, else the most recent past one, else the current week | None. |
| Quick Capture → Nuevo cliente | Client drawer opens over the still-mounted Quick Capture | On save the drawer closes, the new Client is auto-selected, and every value already entered is preserved | Cancelling the drawer returns to Quick Capture unchanged. |

## Validation and resilience

Forms use `noValidate`, attach field errors to their inputs, and prevent duplicate saves. Client forms require name and surname and validate an entered email. Session forms inherit the current client and require date and start time; duration and notes are intentionally optional, while the native status control limits entry to the three permitted states. Duration is entered through `DurationField` (preset pills 30/45/60/90 plus free manual entry): presets only set the value, a typed value is never rounded or snapped to a preset, and blank remains valid. Appointment forms require date and start time, allow blank duration/notes, and limit state to `programada` or `cancelada`. Client Agenda inherits the current Client; Calendar creation requires an explicit Client; editing exposes no reassignment control. Calendar and Client Agenda write Appointments through one shared persistence path (`persistAppointment`), so create/update semantics cannot drift between the two entry points; each keeps its own list reconciliation. Client add/edit and all Appointment create/edit open in the right-side drawer; its `×`, `Cancelar`, scrim click, and Escape are one behaviour (discard and close) — there is no separate "close without saving" control. Calendar week arithmetic treats date-only values as local calendar dates and never converts Appointment wall-clock values through a timezone. Payment forms inherit the current client, require a date and a positive whole-guaraní amount, allow blank notes as `NULL`, and provide no reassignment control. Quick Capture explicitly selects an existing Client (or visibly preselects the active Client), validates the same required Session or Payment fields, and writes through the same create operations; Quick Sessions start unlinked from Payments. A contextual `＋ Nuevo cliente` beside the Client selector opens the standard Client create drawer over the still-mounted Quick Capture and auto-selects the created Client on return without disturbing other entered values — an escape hatch from the selector, not a Quick Capture object. Search and `Estado` filter are local/transient; sorting is the `Cliente`/`Estado` header buttons (default `nombre` asc) with no server-side list contract. No autosave, offline queue, authentication, or authorization behavior exists in this slice. Record deletion remains unsupported for every object (Client, Appointment, Session, Payment): the database grants the browser role no `DELETE`, `client-api.js` has no delete function, and no delete control is shown — its semantics are an open product decision (`TECHNICAL_SPEC.md` DEFERRED → Deletion). When Supabase is absent, visibly labeled in-memory demo records permit UI-only review; they are not a persistence substitute.
