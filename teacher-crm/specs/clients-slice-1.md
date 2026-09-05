# Teacher CRM — Clients (Slice 1) — Spec

## Scope

This slice implements the Clients area only. No Schedule, Payments, Dashboard, or Analytics functionality — those nav items are omitted or disabled in this build, even though they exist in the product map.

## Fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Student Name | text | yes | One Client record represents one student/tutoring relationship. |
| Status | enum: Prospect / Current / Former | yes | Default on create: Prospect. |
| Payer / Contact Name | text | no | Who pays for or is the main contact for the student. |
| Relationship to Student | enum / text | no | Mother, Father, or Other with a short description. Existing saved values remain supported as Other. |
| Phone / WhatsApp | text | no | Free-form; no format validation in V1. |
| School | text | no | Free text. |
| Grade / Year | selection / text | no | Practical school grades from Preescolar through 3° Media, plus Other. Existing saved values remain supported as Other. |
| Notes | long text | no | Free text, no structure. |

No email field. No separate "preferred contact method." No teaching/class fields, payment fields, pricing, or placeholder sections for future Classes/Payments data.

## Create / Edit

- Single form used for both Add and Edit (same field set).
- Only **Student Name** is required to save. All other fields optional.
- Save persists immediately; Cancel discards changes and returns without saving.
- Editing an existing client opens the same form pre-filled; Save overwrites in place.
- No confirmation dialog needed for save (low-risk, easily re-edited).

## Status behavior

- Status is a simple enum, changeable at any time from Detail view (inline) or the Edit form.
- Detail uses one colored status dropdown that saves on change, without a duplicate badge or Update button.
- No business rules attached to status changes in V1 (e.g., no requirement that a "Former" client can't be edited, no auto-transitions). Status is purely descriptive in this slice — Schedule/Payments slices may later add behavior tied to status, but that is out of scope now.

## List view

- Shows: Student Name, Status, Payer / Contact Name, Phone / WhatsApp, School, Grade / Year, Notes (truncated to ~40 chars with ellipsis).
- Search: matches against Student Name only (not contact information, school, grade, or notes) — keep search scope narrow and predictable for V1.
- Filter: multi-select Status checklist with Prospect, Current, and Former. The tutor may select one, multiple, or all statuses. With no status selected, the list is unfiltered. Changes apply immediately with no Apply button.
- Sort: one simple control with Alphabetical A–Z, Most recent, and Oldest. Default: Most recent.
  - Alphabetical A–Z: Student Name ascending.
  - Most recent: most recently created clients first.
  - Oldest: oldest created clients first.
- Search, Status filter, and Sort can be combined. Clear resets the search and Status selection; Sort returns to its default.
- Student Name and Status headers toggle ascending/descending sorting. Status sorts alphabetically by its label. The general Sort control reflects the active order, including reverse-name and Status ordering. No Created column is added; recency stays in the general Sort control.
- The secondary list footer shows "Showing X clients", or "Showing X of Y clients" when search/status filtering reduces results. Y is the total number of user-owned Clients.
- Search/filter/sort state is kept in the URL and preserved when opening a client and returning to the list where practical.
- Clicking a row opens Client Detail in a right-side panel with the list visible behind it. Clicking outside, Escape, or its compact close chevron returns to the list with search/filter/sort state preserved. Direct Client Detail links also work.
- "+ Add Client" button opens the Add form.

## Empty states

- No clients at all: list shows a single message ("No clients yet") + the Add Client button. No table header/columns shown when there's nothing to show them for.
- Search/filter yields no results: message ("No clients match") with a way to clear the search/filter, table columns still shown (so the user isn't confused about whether the feature broke).

## Client Detail

- Displays Student identity/status, student information (School and Grade / Year), contact information (Payer / Contact Name, Relationship to Student, and Phone / WhatsApp), and Notes. Status is an inline editable dropdown.
- Edit button opens the same Add/Edit form, pre-filled.
- A usable Phone / WhatsApp value shows a direct WhatsApp chat link. Stored phone text remains unchanged; incomplete numbers remain text only.
- Back control returns to the list, preserving prior search/filter state.
- No sections for Classes or Payments — omitted entirely, not shown as empty placeholders, per product decision.

## Persistence

- All client data persists across sessions and devices (this is real business data, not scratch state) — requires real backend storage, not localStorage-only, since it must survive logins from the tablet across time.
- Tied to the authenticated user (single user for V1, but data model should key records to a user id from the start, per prior architecture note, even though only one account exists).

## Navigation (this build only)

- Sidebar shows: Dashboard, Clients, Schedule, Payments, Analytics — but only **Clients** is active/clickable. The other four are visibly present (matches the product map) but disabled/greyed, not linking anywhere, so there is no dead navigation that looks functional but isn't.
- At normal tablet/desktop widths, the sidebar is expanded by default.
- A compact menu control appears in the bottom-right area of the sidebar, directly above the tutor profile and Log out area.
- The control collapses the sidebar to a compact state and restores it when clicked again. Navigation remains accessible while collapsed.
- This control manages sidebar presentation only; it does not open a settings or account menu.

## Acceptance criteria

1. User can add a client with only a Student Name and no other fields, and it appears in the list.
2. User can add a client with all fields filled, and Detail shows all of them correctly.
3. User can edit any field of an existing client and the change persists on reload.
4. User can change a client's Status from Detail view without opening the full Edit form.
5. Searching by Student Name (partial, case-insensitive) filters the list correctly.
6. Selecting one or more Status values shows clients matching any selected status; selecting all or clearing the Status selection shows everyone.
7. Search and Status filtering update without an Apply action and can be combined.
8. Sort orders clients correctly by Student Name ascending, most recently created first, or oldest created first; Most recent is the default.
9. Search, Status, and Sort state is preserved when opening a client and returning to the list where practical.
10. Clear resets search and Status filtering and returns Sort to Most recent.
11. Empty client list shows the empty-state message, not an empty table.
12. A search/filter with no matches shows the no-results message, not a blank table.
13. Data persists after logout/login and after a page reload (not lost on refresh).
14. Disabled nav items (Dashboard, Schedule, Payments, Analytics) are visibly present but do not navigate anywhere when clicked.
15. The sidebar can collapse and reopen while keeping navigation accessible, with the control positioned above the tutor profile and Log out area.
16. All client data is scoped to the logged-in user's account in the data model, even though only one account will exist in practice.

## Explicitly out of scope for this slice

- Classes, Schedule, Payments, Dashboard, Analytics (any functionality, not just UI)
- Email field, structured contact-method selection
- Teaching/class fields, payment fields, pricing
- Advanced filter builders, saved views, custom sorting rules, configurable columns, bulk actions, tags, and drag ordering
- Confirmation dialogs on save/delete
- Any status-triggered business logic
- Deleting a client (not mentioned/needed yet — add only if it comes up)
