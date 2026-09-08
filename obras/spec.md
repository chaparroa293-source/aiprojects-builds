# Spec — Obras (v1)

Derived from context.md. Requirements are grouped by entity/flow, each
with acceptance criteria. "Out of scope" items from context.md are not
repeated here as requirements.

## Standing design principle: flexibility

Wherever an entity in this spec doesn't explicitly say otherwise, the
user (father) should be able to freely **add, edit, and delete** it as
his real workflow needs — this app is a reflection of how he actually
works, not a rigid template he has to conform to. The only exception is
where deletion would silently destroy real financial history (see
segment deletion, below) — there, block rather than restrict editing.
Renaming, reorganizing, and correcting mistakes should always be cheap;
losing a money record should always be hard.

---

## 1. Directory (Clients, Suppliers, Employees)

**Requirement:** Firm-wide, reusable records for clients, suppliers,
and employees — created once, reused across any number of projects.

- [ ] Can create/edit/view a Client, Supplier, Employee (name + basic
      contact info: phone, notes)
- [ ] A Supplier or Employee is **not** tied to a single project at
      creation — they exist in the firm-wide directory first
- [ ] From a project, can link an existing Supplier/Employee to it
      (many-to-many), or create a new one inline without leaving the
      project screen
- [ ] Directory list (Clientes / Proveedores / Personal) shows, for
      each record, how many active projects they're currently linked to
- [ ] Deleting/archiving a directory record does not delete historical
      expenses/links that reference it

**Acceptance test:** Create a Supplier once, attach them to two
different projects, confirm they appear correctly on both project pages
and once in the Proveedores directory.

---

## 2. Projects

**Requirement:** A project represents one obra, with an agreed total
price that can be revised over time, and a manual finished/active state.

- [ ] Create a project with: name, client, agreed_total_price, status
      (active/finished — manual toggle, not calculated)
- [ ] Can revise agreed_total_price; each revision is logged
      (price_revision: old value, new value, date, optional reason)
- [ ] Project overview shows: agreed price (current), total spend to
      date (sum of all expenses across all segments), and the delta.
      This is a static comparison only — no burn rate, pacing, or
      forecast in v1.
      This is a static point-in-time comparison — no pacing, burn rate,
      or time-based forecasting in v1
- [ ] Marking a project "finished" is a manual action, always available,
      never auto-triggered by spend or dates

**Acceptance test:** Create a project, revise its price twice, confirm
both revisions show in a visible history and the current price used in
calculations is always the latest one.

---

## 3. Segments (recursive cost tree)

**Requirement:** Arbitrary-depth, project-scoped tree structure used to
categorize expenses. Replaces any fixed phase/milestone model.

- [ ] Create a segment under a project, optionally nested under another
      segment (no fixed depth limit)
- [ ] Rename/delete/reparent a segment
- [ ] Each segment shows total spend = sum of its own expenses + all
      descendant segments' expenses. Since every expense requires a
      segment, this is the single source of truth for spend — project
      totals (section 2) are derived from this, never calculated
      separately
- [ ] Deleting a segment with expenses or child segments requires
      explicit confirmation (state what will happen to them — reassign
      or block deletion, decide during build)

**Acceptance test:** Build a 3-level segment tree on one project, log
expenses at different levels, confirm totals roll up correctly to the
top.

---

## 4. Expense capture (highest priority flow)

**Requirement:** The fastest possible path from "I spent money" to
"logged and correctly attributed." Must be reachable from anywhere in
the app via a universal quick-add, not just from inside a project.

- [ ] Quick-add control is visible/reachable from every screen
- [ ] Minimum required fields to save an expense: amount, project,
      segment. Everything else (supplier, note, photo/attachment) is
      optional and can be added later
- [ ] If entered from within a project, project is pre-filled. If
      entered from the global quick-add (dashboard, not inside a
      project), field order is project → segment → amount; segment
      defaults to the most recently used segment for that project to
      cut a step. If
      entered from the global quick-add (dashboard, not inside a
      project), the order is: project → segment → amount. Segment
      defaults to the most-recently-used segment for that project when
      available, to cut a step
- [ ] Can optionally link an expense to a Supplier (existing or create
      inline)
- [ ] Can optionally attach a file (e.g. receipt photo) at capture time
      or later
- [ ] Amount is entered/stored in guaraníes as whole numbers (no
      decimals). Display uses dot as thousands separator (e.g.
      1.500.000) for easy visual scanning/input — matches how guaraní
      amounts are normally written
- [ ] All UI text (labels, buttons, nav) is in Spanish; user-entered
      data (names, notes, etc.) is never translated/altered
- [ ] One expense = one project, always. If a real-world payment covers
      work across multiple projects, it is logged as separate expense
      entries per project — no split-expense feature
- [ ] Segment is a required field on every expense (no "unsegmented"
      expenses) — this is what keeps project-level and segment-level
      spend totals from ever disagreeing

**Acceptance test:** From the dashboard (not inside any project), log an
expense in under [X] taps/fields — confirm it lands on the correct
project + segment without navigating into the project first.

---

## 5. Requests

**Requirement:** Project-scoped open items/asks — lightweight, not a
full task-management system.

- [ ] Create a request under a project: short text + status
      (open/resolved), with an optional link to a specific segment
      and/or expense (so "check this invoice" can point at the actual
      thing, not just live as free text), optionally linked to a specific segment and/or
      expense it concerns
- [ ] List of open requests, filterable by project
- [ ] Mark resolved

---

## 6. Notes

**Requirement:** Freeform, tagged notes attached to a project — manual
only, no search/AI retrieval in v1.

- [ ] Create a note under a project: free text + optional tag(s), with
      an optional link to a specific segment and/or expense,
      optionally linked to a specific segment and/or expense it
      concerns
- [ ] Notes list per project, most recent first
- [ ] Basic tag filter within a project (exact match, not smart search)

---

## 7. Attachments

**Requirement:** Generic file attachments on any entity, app-level
integrity only (no enforced FK).

- [ ] Can attach a file to: a project, a segment, an expense, a note
- [ ] Attachment stores entity_type + entity_id (string), file
      reference, uploaded date
- [ ] Attachments display correctly on whatever entity they belong to
- [ ] Orphaned attachments (entity deleted) do not crash the app —
      this is a required plan.md task, not a deferred decision: resolve
      concretely before/during build, not ad hoc mid-build

---

## 8. Dashboard

**Requirement:** Read-only aggregation view. Not a data-entry surface.

- [ ] Shows: active projects list, total spend vs. agreed price per
      project (at-a-glance), due-soon/open requests count, recent
      activity feed (recent expenses/notes across all projects)
- [ ] Global search across projects/clients/suppliers/employees
- [ ] Universal quick-add for expenses is present here too

---

## 9. Navigation / shell

- [ ] Sidebar: Clientes / Proveedores / Personal, plus Projects and
      Dashboard
- [ ] Matches the `app-shell` reference prototype's structure

---

## Non-functional / architecture requirements

- [ ] `firm_id` present on every table from the start (single firm used
      for v1, no firm-switching UI needed yet)
- [ ] No auth table in v1 — single implicit user
- [ ] Stack: Next.js (App Router) + Prisma + Postgres
- [ ] Deployed (not local-only) — father accesses and tests it remotely;
      hosting provider (e.g. Vercel, matching QuoteFast precedent) and
      cloud Postgres/file storage to be finalized at plan.md stage
- [ ] All UI text in Spanish

---

## Decisions (resolved)

1. **Deployment target:** Deployed — this build is meant to be deployed
   and tested by the father directly, not run locally.
2. **Segment deletion:** **Block.** Cannot delete a segment while it
   still has child segments and/or expenses under it — everything
   nested must be moved or removed first. Never silently lose an
   expense record. This does not restrict normal editing: renaming,
   reparenting, and adding/removing segments freely is still fully
   supported — block only applies to deleting a segment that still has
   things inside it.
3. **Attachment storage:** Cloud-based (follows from #1 — deployed app
   needs cloud file storage, not local disk). Specific provider to be
   chosen during build/plan stage.
4. **UI language:** Spanish. All user-facing text in the app is in
   Spanish — labels, buttons, nav (Clientes/Proveedores/Personal already
   reflects this).
