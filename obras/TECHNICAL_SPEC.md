# Obras — TECHNICAL_SPEC

**What this document is.** The current domain truth of Obras: what the
system believes about the world, what it guarantees, what it captures,
what it retrieves, and what it derives. It is reconstructed from the
live repository (Prisma schema, migrations, server actions, routes,
views) — not from memory or from any earlier plan.

**What it is not.** Not a changelog, not an implementation walkthrough,
not a backlog, not a UI spec, not a decision log.

---

## UPDATE RULE

TECHNICAL_SPEC.md is a **living but deliberately slow-changing**
document. After this initial reconstruction, change it **only** when a
slice changes durable domain or system meaning:

- a new domain object is introduced;
- an object is removed or materially redefined;
- a field changes semantic meaning (not just its name or storage);
- a relationship or cardinality changes;
- a rule / invariant changes;
- a capture or retrieval contract materially changes;
- a KPI / derivation changes its source, calculation, filter, or meaning;
- persistence or access semantics materially change.

Do **not** touch it for: ordinary commits; bug fixes; styling;
component refactors; file/folder moves; implementation changes that
preserve the same domain contract; temporary experiments; progress
notes.

The test: **"Did our understanding of what Obras represents,
guarantees, captures, retrieves, or derives change?"** If no, this
document almost certainly does not change.

---

## System-wide truths

- **One firm.** There is no `Firm` table and no user model. Every
  table carries a `firm_id` column; every read is filtered by it and
  every write stamps it, using a single constant id
  (`DEFAULT_FIRM_ID`, default `"firm_default"`). The column exists so
  multi-firm is a data change, not a schema change, later.
- **One shared gate, no identities.** The whole app sits behind a
  single shared password (`AUTH_PASSWORD_HASH`, a scrypt hash;
  `SESSION_SECRET` signs the session). Access is all-or-nothing: there
  are no accounts, roles, permissions, or per-actor attribution, and
  nothing is recorded about *who* performed an action. The session is
  a signed, expiring cookie — **no `Session` or `User` table exists**,
  so this adds no domain object. Missing or malformed configuration
  denies access rather than granting it.
- **Money is guaraníes, integer, no decimals.** Amounts persist as
  Postgres `BIGINT` and cross into the app as JavaScript `number`
  (guaraní magnitudes are assumed to stay within safe-integer range).
  Displayed with `.` as the thousands separator (`₲ 1.500.000`). Input
  is parsed leniently (`"1.500.000"`, `"1500000"`, `"₲ 1 500 000"` all
  accepted); negatives and decimals are rejected.
- **Deletion philosophy.** Hard delete is the default. It is **blocked**
  wherever it would silently destroy financial history:
  - a Project with ≥1 Expense cannot be hard-deleted (Archive instead);
  - a Segment with ≥1 child Segment or ≥1 Expense cannot be deleted.
  Both blocks are enforced in the application *and* backstopped by
  `onDelete: Restrict` foreign keys. Deleting a directory record
  (Client / Supplier / Employee) is always allowed and never cascades
  into money: an Expense's `supplierId` is set null, links are removed.
- **History is not kept**, with one exception. Mutable models carry
  `created_at` / `updated_at`; edits overwrite in place. The single
  audited change is a Project's agreed price — see `PriceRevision`.
- **Access pattern.** All pages render dynamically per request. All
  writes are Next.js Server Actions that revalidate the affected
  routes. Retrieval is always scoped to the firm.

---

## Domain objects

Nine persisted objects exist today: **Client, Supplier, Employee,
Project, Segment, Expense, PriceRevision, ProjectSupplier,
ProjectEmployee**. `Request`, `Note`, and `Attachment` appear in
`specs/v1/` but are **not built** and are not part of current truth.

### Client  (`clients`)

- **Meaning.** A party the firm builds *for*. The client on a project's
  contract.
- **Fields.** `id` (cuid, pk); `firmId`; `name` **required**; `phone`
  nullable; `ruc` nullable (Paraguayan tax id, no format or uniqueness
  enforced); `notes` nullable; `createdAt`; `updatedAt`.
- **Relationships / cardinality.** `Client 1 — 0..N Project` via
  `Project.clientId` (nullable FK, `onDelete: SetNull`). No other
  relations.
- **Invariants.** `name` non-empty. Nothing else.
- **Operations.** Create, edit, delete (hard, unconditional). Deleting
  a client nulls `clientId` on its projects; the projects survive.
- **Capture.** Manual only — the directory form, reached from
  `/clientes` (**+ Nuevo cliente**) or the universal **+ Agregar → Cliente**.
- **Retrieval.** `/clientes` list (name, phone, names of linked
  projects); `/clientes/[id]` detail (contact data, notes, linked
  projects with status). Global search matches `name` and `phone`.
- **History.** None.
- **Derivations.** `activeProjectCount` = number of linked projects
  that are `ACTIVE` and not archived. `linkedProjects` = every project
  whose `clientId` is this client.
- **Persistence.** One row per client; edits in place.

### Supplier  (`suppliers`)

- **Meaning.** A vendor the firm buys materials/services from. The
  optional counterparty on an Expense.
- **Fields.** Same shape as Client: `id`, `firmId`, `name` **required**,
  `phone?`, `ruc?`, `notes?`, `createdAt`, `updatedAt`.
- **Relationships / cardinality.**
  - `Supplier 1 — 0..N Expense` via `Expense.supplierId` (nullable FK,
    `onDelete: SetNull`).
  - `Supplier M — N Project` via `ProjectSupplier`.
- **Invariants.** `name` non-empty.
- **Operations.** Create, edit, delete (hard, unconditional). Delete
  removes `ProjectSupplier` links (cascade) and sets `supplierId` null
  on its expenses — the expenses and their amounts are untouched.
  A supplier may also be **created inline while capturing an Expense**.
- **Capture.** Manual (directory form, from `/proveedores` or
  **+ Agregar → Proveedor**); or **inline during Expense capture** (a
  "+ Nuevo" choice in the supplier picker creates the row and attaches
  it to that expense in one step).
- **Retrieval.** `/proveedores` list (name, phone, linked project
  names); `/proveedores/[id]` detail (contact data, notes, linked
  projects **with amount spent per project**, and a list of every
  Expense that names this supplier). Global search matches `name` and
  `phone`; a supplier's name also surfaces Expense results.
- **History.** None.
- **Derivations.** `totalSpend` = Σ `amount` of expenses with this
  `supplierId`. Per-project `spend` = the same, grouped by project.
  `activeProjectCount` / `linkedProjects` = projects the supplier is
  linked to **or** has an expense on (union), active-and-not-archived
  for the count.
- **Persistence.** One row per supplier; edits in place.

### Employee  (`employees`) — labelled "Personal" in the UI

- **Meaning.** A person who works on the firm's obras (staff / crew).
- **Fields.** Same shape: `id`, `firmId`, `name` **required**, `phone?`,
  `ruc?`, `notes?`, `createdAt`, `updatedAt`.
- **Relationships / cardinality.** `Employee M — N Project` via
  `ProjectEmployee`. **No relationship to Expense or to any cost.**
- **Invariants.** `name` non-empty.
- **Operations.** Create, edit, delete (hard, unconditional). Delete
  removes `ProjectEmployee` links (cascade).
- **Capture.** Manual only — directory form, from `/personal` or
  **+ Agregar → Personal**.
- **Retrieval.** `/personal` list (name, phone, linked project names);
  `/personal/[id]` detail (contact data, notes, linked projects). Global
  search matches `name` and `phone`.
- **History.** None.
- **Derivations.** `activeProjectCount` / `linkedProjects` from
  `ProjectEmployee`. **No spend/cost figure** — there is no data path
  from a person to money in the model.
- **Persistence.** One row per employee; edits in place.

### Project  (`projects`) — an *obra*

- **Meaning.** One construction job. The unit everything financial
  attaches to.
- **Fields.**
  - `id` (cuid, pk); `firmId`.
  - `name` **required**.
  - `clientId` **nullable** FK → Client (`onDelete: SetNull`). A project
    may exist with no client assigned.
  - `agreedTotalPrice` **required** `BigInt` — the *current* agreed
    contract price in guaraníes.
  - `status` enum `ProjectStatus` = `ACTIVE | FINISHED`, default
    `ACTIVE`.
  - `archivedAt` **nullable** DateTime.
  - `createdAt`, `updatedAt`.
- **Relationships / cardinality.**
  - `Client 0..1 — 0..N Project`.
  - `Project 1 — 0..N Segment` (`onDelete: Cascade`).
  - `Project 1 — 0..N Expense` (`onDelete: Restrict`).
  - `Project 1 — 0..N PriceRevision` (`onDelete: Cascade`).
  - `Project M — N Supplier` via `ProjectSupplier`.
  - `Project M — N Employee` via `ProjectEmployee`.
- **Invariants.**
  - `agreedTotalPrice` is *only* changed through the price-revision
    operation, which writes a `PriceRevision` and updates the field in
    one transaction. It is never edited directly (the edit form
    presents it read-only). The price set at creation is the starting
    value, **not** a revision.
  - `status` is a **manual** toggle. It is never inferred from spend,
    dates, or anything else.
  - `archivedAt` is set/cleared manually. An archived project is hidden
    from the active list and from Expense capture pickers, but stays
    fully readable and its records intact.
  - **Hard delete is blocked while the project has ≥1 Expense.** The
    user must Archive instead. A project with 0 expenses deletes,
    cascading its Segments and PriceRevisions (neither is spent-money).
- **Operations.** Create (→ lands on the new project's page); edit
  (name, client, status); revise agreed price; toggle status;
  archive / unarchive; delete (guarded as above).
- **Capture.** Manual only — the project form, from `/proyectos`
  (**+ Nuevo proyecto**) or **+ Agregar → Proyecto**.
- **Retrieval.**
  - `/proyectos` — card grid of projects that are `ACTIVE` **and** not
    archived.
  - `/historial` — projects that are `FINISHED` (and not archived), and
    separately all archived projects.
  - `/proyectos/[id]` — the project workspace: spend-vs-price summary,
    the segment tree, recent expense activity, linked suppliers &
    personnel, and the archive/delete controls.
  - Global search matches `name`.
- **History.** `PriceRevision` records agreed-price changes. Status and
  archive transitions are **not** logged — only the current state and
  `updatedAt`.
- **Derivations.**
  - **spend to date** = Σ `amount` of all the project's expenses.
  - **difference** = `agreedTotalPrice − spend` (shown as remaining, or
    as overrun when negative).
  - **percent of agreed price** = `spend / agreedTotalPrice`, clamped
    to 100 for the progress bar.
  These are point-in-time comparisons only — no burn rate, pacing, or
  forecast.
- **Persistence.** One row; `agreedTotalPrice` mutated only via the
  transaction above.

### Segment  (`segments`) — the cost-breakdown tree

- **Meaning.** A node in a project's arbitrary, recursive cost
  breakdown. Replaces any fixed phase/rubro template — the tree matches
  how the user actually thinks about *this* obra's costs. Every Expense
  is filed under exactly one segment.
- **Fields.** `id` (cuid, pk); `firmId`; `projectId` FK → Project
  (`onDelete: Cascade`); `parentId` **nullable** self-FK
  (`onDelete: Restrict`), `null` = root; `name` **required**;
  `createdAt`, `updatedAt`.
- **Relationships / cardinality.**
  - `Project 1 — 0..N Segment`.
  - `Segment 0..1 parent — 0..N children` (same project only).
  - `Segment 1 — 0..N Expense` (`onDelete: Restrict`).
- **Invariants.**
  - A segment belongs to exactly one project; its parent (if any) is in
    the same project.
  - **Delete is blocked** while it has ≥1 child segment or ≥1 Expense —
    the user must move or remove those first. Enforced in-app and by
    `Restrict` FKs.
  - **Reparent** rejects: making a segment its own parent; moving a
    segment under one of its own descendants (cycle); a target in
    another project.
- **Operations.** Create (at root, or under a chosen parent); rename;
  reparent (via a "move under" picker; no drag-and-drop); delete
  (guarded as above). All from the project page's tree.
- **Capture.** The segment tree on `/proyectos/[id]` — an inline "+" on
  any node adds a child, "+ Segmento raíz" adds a root. Also
  **+ Agregar → Segmento**, which asks which project and adds at that
  project's root (re-nest afterward from the tree).
- **Retrieval.** Rendered only as the collapsible indented tree inside
  the project page (whole tree expanded by default, each node
  individually collapsible). Segments are not individually routable and
  are not in global search.
- **History.** None.
- **Derivations (per node).**
  - `ownSpend` = Σ `amount` of expenses filed **directly** on this
    segment.
  - `totalSpend` = `ownSpend` + Σ `totalSpend` of all descendants
    (rolled up the tree). This roll-up is the intended single source of
    truth for where a project's money went; the project total is the
    same sum taken flat.
- **Persistence.** One row per node; the tree is the `parentId` chain.

### Expense  (`expenses`) — a *gasto* (purchase / expense)

- **Meaning.** One outflow of money on one obra, attributed to one cost
  segment. The highest-frequency object in the system and the reason it
  exists (correct project + category attribution of every gasto).
- **Fields.**
  - `id` (cuid, pk); `firmId`.
  - `projectId` **required** FK → Project (`onDelete: Restrict`).
  - `segmentId` **required** FK → Segment (`onDelete: Restrict`).
  - `supplierId` **nullable** FK → Supplier (`onDelete: SetNull`).
  - `amount` **required** `BigInt` — guaraníes, must be a positive whole
    number.
  - `description` nullable.
  - `spentAt` DateTime, default now — the date the money was spent, may
    differ from `createdAt` (when it was logged).
  - `createdAt`, `updatedAt`.
- **Relationships / cardinality.** `Project 1 — 0..N Expense`;
  `Segment 1 — 0..N Expense`; `Supplier 0..1 — 0..N Expense`.
- **Invariants.**
  - **One expense = exactly one project + exactly one segment.** There
    is no "unsegmented" expense and no expense split across projects; a
    real payment covering several obras is entered as several expenses.
  - The chosen segment must belong to the expense's project.
  - `amount` must parse to a whole number `> 0`.
  - An edit may change segment, supplier, amount, date, description —
    but **not** the project. To move an expense to another project it
    is deleted and re-entered.
  - Delete is permitted (with a confirmation step) and permanent; it is
    **not** blocked, unlike Project/Segment deletion.
- **Operations.** Create; edit (project fixed); delete.
- **Capture — two paths into the same row:**
  1. **Quick Capture** — the sidebar **+ Agregar**, where *Gasto* is
     the pre-selected pane, reachable from every screen. Visual
     chip pickers for project → segment → (optional) supplier, and a
     number field for amount. Stays open after saving with a running
     "logged this session" list for rapid entry. Remembers the last
     project+segment for the session and defaults the segment to that
     project's most-recently-used one.
  2. **In-project capture** — **+ Registrar gasto** on a project page:
     the same form with the project fixed.
  Both call the same operation and produce identical rows — there is no
  separate "manual entry" form; both paths *are* the structured form.
  Supplier may be picked or created inline in either path.
- **Retrieval.**
  - On the project page — "Actividad reciente": the project's expenses,
    newest first by `spentAt` then `createdAt`, showing date, segment
    path, supplier, amount; each row opens an edit popup; expandable to
    the full list.
  - On a supplier's detail page — every expense naming that supplier,
    across all projects.
  - Global search — matches an expense by `description`, by supplier
    name, or by exact `amount`; the result shows project + full segment
    path + amount and links to the project page.
- **History.** None per expense — edits overwrite; only `updatedAt`.
- **Derivations.** Expenses are the input to **every** money figure in
  the system: segment `ownSpend` / `totalSpend`, project spend / delta
  / percent, supplier `totalSpend` and per-project spend.
- **Persistence.** `amount` stored `BIGINT`, surfaced as `number`.

### PriceRevision  (`price_revisions`)

- **Meaning.** One immutable log entry recording a single change to a
  project's agreed contract price. This *is* the history mechanism for
  `Project.agreedTotalPrice`.
- **Fields.** `id` (cuid, pk); `firmId`; `projectId` FK → Project
  (`onDelete: Cascade`); `oldValue` `BigInt`; `newValue` `BigInt`;
  `reason` nullable; `createdAt`. No `updatedAt` — append-only.
- **Relationships / cardinality.** `Project 1 — 0..N PriceRevision`.
- **Invariants.**
  - Created only by the price-revision operation, in the same
    transaction that sets `Project.agreedTotalPrice = newValue`.
  - `newValue ≠ oldValue` (a no-op revision is rejected).
  - Never edited or deleted on its own. Cascade-deleted with its
    project — which is only possible when that project has no expenses.
  - The project's initial price is not represented as a revision.
- **Operations.** Create (only, via "Revisar precio").
- **Capture.** The "Revisar precio" popup on the project page: new
  price + optional reason.
- **Retrieval.** The "Historial de precio" popup on the same page,
  newest first. Not in global search.
- **History.** It is the history.
- **Derivations.** None itself; it explains changes to the derivations
  that depend on `agreedTotalPrice`.
- **Persistence.** Append-only rows.

### ProjectSupplier  (`project_suppliers`)  — association

- **Meaning.** "This supplier is associated with this obra." The
  firm-wide supplier directory reused across any number of projects,
  independent of whether money has moved yet.
- **Fields.** `id` (cuid, pk); `firmId`; `projectId` FK → Project
  (`onDelete: Cascade`); `supplierId` FK → Supplier
  (`onDelete: Cascade`); `createdAt`. Unique on
  `(projectId, supplierId)`.
- **Cardinality.** Realises `Project M — N Supplier`.
- **Invariants.** At most one row per (project, supplier). The link is
  not financial history: removing it is unconditional and does not
  touch that supplier's expenses on the project.
- **Operations.** Link / unlink, from the project page's
  "Proveedores y personal" panel (link is idempotent).
- **Capture.** That panel only.
- **Retrieval.** Shown as chips on the project page; contributes to a
  supplier's "linked projects" on its detail page and list row.
- **History / derivations / persistence.** None / none / one row per
  link.

### ProjectEmployee  (`project_employees`)  — association

- **Meaning.** "This person works on this obra."
- **Fields.** `id`, `firmId`, `projectId` FK → Project (`Cascade`),
  `employeeId` FK → Employee (`Cascade`), `createdAt`. Unique on
  `(projectId, employeeId)`.
- **Cardinality.** Realises `Project M — N Employee`.
- **Invariants.** At most one row per (project, employee). Not
  financial history; unlink is unconditional.
- **Operations / capture.** Link / unlink from the same project panel.
- **Retrieval.** Chips on the project page; a person's "linked
  projects" on their detail page and list row.
- **History / derivations / persistence.** None / none / one row per
  link.

---

## Capture & retrieval contract (summary)

| Object | How it enters Obras | How the user finds it again |
|---|---|---|
| Client | Directory form (`/clientes` or **+ Agregar**) | `/clientes` list; `/clientes/[id]`; global search (name, phone) |
| Supplier | Directory form; **or inline during Expense capture** | `/proveedores` list; `/proveedores/[id]` (+ its expenses & spend); global search (name, phone; name also surfaces expenses) |
| Employee | Directory form | `/personal` list; `/personal/[id]`; global search (name, phone) |
| Project | Project form (`/proyectos` or **+ Agregar**) | `/proyectos` (active); `/historial` (finished/archived); `/proyectos/[id]`; global search (name) |
| Segment | Project-page tree (inline **+**); **or + Agregar → Segmento** (adds at root) | The tree on `/proyectos/[id]` only |
| Expense | **Quick Capture** (**+ Agregar**, *Gasto* pane, any screen) **or** **+ Registrar gasto** on a project | Project page "Actividad reciente" + edit popup; supplier detail page; global search (description, supplier, exact amount) |
| PriceRevision | "Revisar precio" popup on a project | "Historial de precio" popup on that project |
| ProjectSupplier / ProjectEmployee | "Proveedores y personal" panel on a project | Chips on the project; "linked projects" on the directory record |

---

## Routes / views

| Route | View |
|---|---|
| `/ingresar` | shared-password gate; the only route reachable without a session |
| `/` | redirect → `/proyectos` |
| `/clientes`, `/proveedores`, `/personal` | directory list for that kind (name, phone, linked project names) |
| `/clientes/[id]`, `/proveedores/[id]`, `/personal/[id]` | full-screen directory record detail (contact data incl. RUC, notes, linked projects; for suppliers also per-project spend and an expense list) |
| `/proyectos` | card grid of active, non-archived projects |
| `/historial` | finished projects, and archived projects, in two sections |
| `/proyectos/[id]` | project workspace: spend-vs-price, segment tree, recent expenses, linked suppliers/personnel, archive/delete |

Cross-cutting UI surfaces: a collapsible sidebar with the universal
**+ Agregar** entry point (Gasto is the default), and a global search
box that returns projects, directory records, and expenses with full
context.

---

## Not in the model (deliberately)

- **Request, Note, Attachment** — described in `specs/v1/spec.md`, not
  built. No tables, routes, or operations exist.
- **Firm / User** — single implicit firm; no user records, no roles,
  no permissions, no per-actor attribution. The password gate above is
  a deployment boundary, not an identity model.
- **Multi-currency** — guaraníes only.
- **A layer between Project and Segment** (sprints / phases /
  milestones) — considered and explicitly parked; Project → Segment is
  direct.
- **Any burn-rate / pacing / forecast** on spend — only static
  point-in-time comparisons.
