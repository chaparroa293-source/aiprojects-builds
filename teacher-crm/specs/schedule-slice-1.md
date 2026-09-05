# Teacher CRM — Schedule (Slice 1) — Spec

## Scope

This slice adds manual management of individual tutoring Classes and a lightweight Regular Schedule concept. It extends Client Detail to surface the same Client → Classes relationship from the student's context.

Schedule is not a recurrence system. Individual Classes remain freely editable and are the source of truth for what is scheduled, completed, cancelled, or missed.

All entered and displayed tutoring dates and times use the fixed product timezone `America/Asuncion`, not the viewer or device timezone.

## Objects and fields

### Class

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Client / Student | Client reference | yes | Each Class belongs to one existing Client. |
| Date | date | yes | Tutoring date in `America/Asuncion`. |
| Start Time | time | yes | Tutoring start time in `America/Asuncion`. |
| Duration | positive integer minutes | yes | Used to calculate the displayed end time. No global default in this slice. |
| Status | enum: Scheduled / Completed / Cancelled / Missed | yes | Default on create: Scheduled. |
| Class name / topic | text | no | Optional short description such as “Math review”; it never includes the Student Name automatically. |
| Notes | long text | no | Free text specific to the Class. |

System-managed identifiers and created/updated timestamps are persisted but are not user-entered product fields.

### Regular Schedule Slot

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| Client / Student | Client reference | yes | Each slot belongs to one existing Client. |
| Weekday | enum: Monday–Sunday | yes | The student's normal tutoring day. |
| Start Time | time | yes | Normal start time in `America/Asuncion`. |
| Duration | positive integer minutes | yes | Normal class duration. |

A Client may have zero, one, or multiple Regular Schedule Slots.

## Relationships and ownership

- One Client can have many Classes.
- Every Class belongs to exactly one Client.
- One Client can have zero or more Regular Schedule Slots.
- Classes and Regular Schedule Slots belong to the same authenticated user as their Client.
- Authenticated-user isolation is enforced with Row Level Security. A user cannot read, create, or edit a Class or slot attached to another user's Client.
- Changing or removing a Regular Schedule Slot never changes an existing Class.

## Schedule view

- Use a weekly agenda view covering Monday through Sunday. Do not add a month view or calendar grid.
- Default to the current week in `America/Asuncion`.
- Provide Previous week, Today, and Next week controls.
- Group Classes by date and order each day's Classes by Start Time.
- Show the time range, Student Name, Status, and truncated Notes when present.
- Clicking a Class opens Edit Class.
- Clicking the Student Name opens Client Detail.
- Scheduled, Completed, Cancelled, and Missed Classes remain visible with restrained status treatment.
- An Add Class action appears in the upper-right area of the Schedule header.
- Do not add Schedule search, filters, alternate views, drag-and-drop, or configurable calendar controls.

## Add / Edit Class

- Use one shared form for Add and Edit with the same field set: Client / Student, Date, Start Time, Duration, Status, and Notes.
- Client selection is searchable by partial student name and requires selecting an existing Client; it does not create Clients.
- Duration uses Hours (0–5) and Minutes (00 / 15 / 30 / 45), stored as positive total minutes. Existing durations outside those choices are preserved until explicitly changed.
- Add Class is accessible from Schedule and Client Detail.
- Each Schedule day has a lightweight Add Class action that preselects that day’s date.
- When opened from Client Detail, the Client is preselected.
- When creating a Class for a Client who has Regular Schedule Slots, those slots may be offered as quick defaults. Selecting one may prefill the relevant date, time, and duration values, but all Class fields remain freely editable.
- Selecting a Regular Schedule Slot does not create a Class until the tutor saves the form.
- Save persists immediately. Cancel returns to the originating Schedule week or Client Detail without saving.
- Editing changes the individual Class only.
- Rescheduling is done by changing Date and/or Start Time on the same Class.
- Edit Class includes a separate origin-aware Back control as well as Cancel.
- Edit Class offers deletion with an explicit confirmation. Only the selected user-owned Class is deleted, leaving its Client and Regular Schedule Slots unchanged. After deletion, return to the originating Schedule week or Client Detail.

## Class status behavior

- New Classes default to Scheduled.
- Status can be changed at any time through Edit Class.
- Scheduled, Completed, Cancelled, and Missed use restrained, distinct semantic color treatments while retaining their text labels.
- Status is manual and descriptive. The system does not automatically mark past Classes Completed or Missed.
- Cancelled and Missed Classes remain visible in Schedule and Client Detail.
- Status changes do not trigger billing, notifications, or other automation.

## Classes in Client Detail

- Add a Classes section below the existing Client information.
- Show Date, Start and calculated End Time, Duration, Status, and Notes when present.
- Show upcoming Classes first, nearest first. Show past Classes afterward, most recent first.
- Add Class opens the shared form with that Client preselected.
- Clicking a Class opens Edit Class.
- Saving or cancelling returns to Client Detail when the flow began there.

The Clients Slice 1 instruction to omit Classes applies to the earlier Clients-only build. This Schedule slice intentionally adds the approved Classes relationship to Client Detail without otherwise changing Client fields or behavior.

## Regular Schedule in Client Detail

- Add a lightweight Regular Schedule section to Client Detail.
- Show each slot's Weekday, Start Time, calculated End Time, and Duration.
- The tutor can add, edit, and remove Regular Schedule Slots.
- Slots serve only as quick defaults for creating individual Classes.
- Slots do not automatically generate Class records or define recurrence exceptions.

## Empty states

- No Classes in the selected week: show "No classes this week" with Add Class. Week navigation remains visible.
- Client has no Classes: show "No classes yet" with Add Class.
- Client has no Regular Schedule Slots: show "No regular schedule" with an Add regular time action.
- No Clients exist: explain that a Client must be added before a Class can be created and link to Add Client.

## Navigation

- Sidebar shows Dashboard, Clients, Schedule, Payments, and Analytics.
- Clients and Schedule are clickable. The current page is shown as active.
- Dashboard, Payments, and Analytics remain visibly disabled and non-interactive, with no routes or functionality.
- Preserve the shared collapsible-sidebar behavior specified for the application shell. Collapsing the sidebar does not remove access to Clients or Schedule.

## Acceptance criteria

1. Tutor can create a Class for an existing Client with all required fields.
2. New Classes default to Scheduled.
3. All entered and displayed tutoring dates and times use `America/Asuncion` regardless of viewer/device timezone.
4. Classes persist after reload and logout/login.
5. Current-week Classes are grouped by date and ordered by Start Time.
6. Previous week, Today, and Next week controls show the correct Monday–Sunday range.
7. Tutor can edit Client, Date, Start Time, Duration, Status, and Notes on an existing Class.
8. Changing Date or Start Time reschedules the same Class instead of creating another.
9. Tutor can mark a Class Completed, Cancelled, or Missed.
10. Cancelled and Missed Classes remain visible.
11. Client Detail shows only that Client's upcoming and past Classes in the specified order.
12. Add Class from Client Detail preselects that Client and returns there after Save or Cancel.
13. Tutor can create, edit, and remove zero or more Regular Schedule Slots for a Client.
14. A selected Regular Schedule Slot may prefill a new Class's relevant Date, Start Time, and Duration, while every Class field remains editable.
15. Regular Schedule Slots never create Classes automatically.
16. Editing or removing a Regular Schedule Slot does not alter existing Classes.
17. Classes and Regular Schedule Slots are scoped to the logged-in user's account and isolated with Row Level Security.
18. Clients and Schedule are clickable navigation destinations; Dashboard, Payments, and Analytics remain disabled.
19. Empty Schedule, Client Classes, Regular Schedule, and no-Clients states display the specified guidance.
20. Tutor can confirm or abandon Class deletion from Edit Class; confirmed deletion is owner-scoped and returns to the originating view.

## Explicitly out of scope

- Automatic recurring-Class generation
- Recurrence rules or exception handling
- Month view, calendar grid, or multiple Schedule views
- Drag-and-drop rescheduling
- External calendar synchronization
- Reminders or notifications
- Availability management
- Group Classes or multiple Clients per Class
- Classes without a Client
- Billing, pricing, invoices, or payment effects
- Attendance beyond Scheduled, Completed, Cancelled, and Missed
- Teaching plans, subjects, homework, or lesson content
- Dashboard or Analytics aggregation
- Schedule search, filtering, or configurable display
- Timezone selection UI
- Google authentication or account-management additions
