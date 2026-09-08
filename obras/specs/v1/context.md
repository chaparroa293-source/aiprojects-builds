# Context — Obras

## Who this is for
Father — a civil engineer/architect in Paraguay who manages construction
execution (*obras*) himself, with no secretary. He often runs multiple
obras at the same time, sharing workers and suppliers across them.
Money is tracked in guaraníes.

## The core problem
Right now, project tracking is scattered / on paper — no real system.

His single biggest, stated pain: **attributing each expense to the
correct project and cost-category.** With several obras running in
parallel and people/suppliers moving between them, it's easy to lose
track of what money went where.

Everything else the tool does (directory, notes, dashboard) supports
that core problem or acts as a general "firm memory" layer — it is not
the primary problem being solved.

## What "done" looks like for v1
He can, for any obra:
- See where it stands (segments, spend so far vs. agreed price)
- Log a new expense fast, correctly attributed to a project + segment
- Look up a supplier/client/employee once and reuse them across obras
- Jot a freeform note or open request without losing it
- See a dashboard of what needs attention across all active obras

He does **not** need (v1, deliberately out of scope):
- Multiple users / auth (single-user, single-firm)
- Search/AI retrieval over notes (manual notes only for now)
- Enforced referential integrity on attachments (app-level only)
- Fixed milestone payments / certifications
- Anything beyond Paraguay/guaraní — no multi-currency

## How the business actually works
- A project (obra) goes through a design/approval phase, then execution
- Execution is self-managed by him directly — no site secretary
- Multiple obras run simultaneously, sharing the same pool of workers
  and suppliers
- Suppliers/employees/clients are firm-wide entities, not scoped to one
  project — some are reused across many obras, some are one-off
- Cost isn't tracked against fixed phases — it's tracked against an
  arbitrary, recursive breakdown of the project (a *segment* tree), so
  the structure can match however he actually thinks about each obra's
  cost categories, not a fixed template
- A project has one agreed total price with the client, which can be
  revised over time (not fixed milestone payments)
- "Finished" isn't a calculated state — it's a manual toggle he flips
  once final payment is received

## Data model (agreed)
```
Firm (implicit, firm_id on all tables — single firm for v1, but modeled
      for future multi-firm)
├── Client
├── Supplier ──────┐
├── Employee        │  shared directory, reused across projects
│                    │
└── Project          │
    ├── agreed_total_price
    ├── price_revision (history of changes to the above)
    ├── Segment (recursive tree — arbitrary depth, replaces
    │            old "rubro"/"phase"/"deliverable" idea)
    │   └── Expense/Purchase (attributed to a segment;
    │                          optional link to a Supplier)
    ├── Request (open items/asks, project-scoped)
    ├── Note (freeform, tagged, project-scoped)
    └── Attachment (entity_type + entity_id string pair,
                     no enforced FK — app-level integrity only)
```

## UI priorities (agreed)
- **Fast expense capture is the priority interaction** — this is the
  thing he'll do most often, on the fly, mid-work. It should be the
  cheapest possible path from "I just spent money" to "logged and
  correctly attributed."
- Universal "quick add" accessible from anywhere in the app (not
  screen-specific) — capture should never require navigating first
- Dashboard is read-only aggregation (due soon, active projects, recent
  activity, search) — not a new data-entry surface
- Sidebar nav: Clientes / Proveedores / Personal (+ Projects/Dashboard)
- Generic file attachments (photos of receipts, etc.) on any entity

## Reference material already built
Five React prototypes exist at `~/Dev/reference-prototypes/`:
`app-shell`, `dashboard`, `project-overview`, `expense-capture`,
`directory-split`. These are visual/interaction references for the
build, not the build itself — they encode agreed UI decisions
(especially expense-capture, which is the highest-priority flow).

## Stack (agreed)
Next.js (App Router) + Prisma + Postgres. Single-user/single-firm for
v1, no auth table yet — but `firm_id` present on all tables from the
start for future scalability.

## Where this lives
Builds under `~/Dev/aiprojects-builds/obras/` (never a standalone repo).
