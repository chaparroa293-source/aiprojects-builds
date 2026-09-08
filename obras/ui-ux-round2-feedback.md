# UI/UX Round 2 — feedback after first rebuild pass

Feedback on the Slice 1–3 UI rebuild (commit 390b492), from hands-on
use. Directory stays full-screen per the original template — confirmed,
no change. Everything below is either ready to build now, or explicitly
parked with the reason why.

---

## Ready to build now

### 1. Proyectos list → cards, not a table
Current `/proyectos` is a spreadsheet-style table (Nombre / Cliente /
Estado / Precio / Segmentos / Gastos columns). Replace with a visual
card grid — one card per project, more scannable at a glance than table
rows. Exact card content/layout is a later visual pass; for now, just
the shift from table to card grid.

### 2. Directory: show the actual list, not just a count
Currently "Proyectos activos" shows a bare number. Replace with the
actual list of linked project names (already have the data — this is
a display change, not new data). Additionally: for Personal
(Employees) specifically, since we already track which expenses link
to which supplier, add a parallel view of **total paid to this person
to date** where an Employee has associated cost — surface it the same
way spend-per-supplier already works.

### 3. A real Historial (history) section
Right now "archived" is a hidden query param (`/proyectos?archivados=1`)
tucked behind a small link — not a real place in the app. Add
**Historial** as its own nav item (next to Proyectos), listing finished/
archived projects as a proper section, not an afterthought. This is
about lifecycle: a project has a life (active → finished/archived) and
the app should have a visible "done" home for it, not just a filter.

### 4. Gasto rápido — replace dropdowns with visual buttons/chips
This is the most important item here, since it's the highest-priority
flow in the app. Current version uses `<select>` dropdowns for
Proyecto/Segmento/Proveedor. Redesign as tappable button/chip pickers
instead:
- Proyecto: a row of project chips/cards (not a dropdown) — tap to
  select
- Segmento: same, chips for that project's segments (respecting the
  tree — likely just the flat list of leaf-ish options, or recently-
  used ones surfaced first)
- Proveedor (optional section): same pattern
- Monto stays a plain number input — that one's fine as-is
This should feel like reducing the database to a few tappable buttons,
not filling out a form. Visual and fast, not a dropdown-driven form.

### 5. The main add button becomes the universal entry point, not just expenses
The sidebar's main "+" button should not be expense-only. It's meant
to be **the primary place he goes to input anything** — a new expense,
a new client/supplier/employee, a new project, a new segment, a request,
a note (once those exist). Think of it as one universal "add" entry
point with a first step of "what are you adding?" (a small set of
options — Gasto, Cliente, Proveedor, Personal, Proyecto, Segmento —
as chips/buttons, same visual pattern as item #4), which then routes
into that specific thing's existing add flow. Gasto stays the fastest/
most prominent option since it's used most often — this isn't about
slowing expense capture down, it's about not needing a different
button in a different place for every other kind of add.

---

## Parked — not v1, documented for later

### Sprints / phases within a project
Raised as a possible layer between Project and Segment (e.g. Project →
Sprint → Segment), for grouping work into sequences/batches over time.
**Not building now** — genuine uncertainty about whether this matches
how the father actually works, and it's a structural change that's
costly to retrofit if built wrong, cheap to add later once real usage
shows whether "batches of work over time" is something he'd reach for.
A lighter version (a simple checklist/milestone marker, not a full
structural layer) was also raised as more plausible but still not a
core use case — same verdict, revisit after real usage.

---

## Explicitly not changing

Directory record detail stays a full-screen page (not a popup) — shows
too much linked information (projects, expenses, spend) to work well as
an overlay. Original template decision confirmed.
