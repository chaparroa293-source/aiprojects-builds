# UI/UX Design Template — Obras

Purpose: capture *how this should feel and behave*, not just what data it
holds — so Claude Code builds the real interface once, instead of
generic forms we redo later. Fill this out screen by screen. Once
complete, this becomes the spec Claude Code rebuilds the UI against.

## Standing principles (apply to every screen below)

- **Functionality first** — every screen has to actually work for daily
  real use, not just look clean
- **Flexibility** — nothing is locked into a rigid template; the app
  bends to how he actually works
- **Easy input** — the fastest path from "I need to log this" to "it's
  logged," especially for expenses
- **Easy to find** — he should never have to hunt or scroll to locate
  something he just entered
- **Everything is connected** — a segment, expense, note, request,
  supplier should all visibly link to what they relate to, not live in
  isolated lists
- **Edit / add / delete, always** — every entity supports all three,
  everywhere, without needing to leave the screen to do it

## Interaction conventions (apply to every screen below)

- **Click outside to close** — any dropdown, popup, or modal closes
  automatically when you click outside it. No dead zones where you
  have to hunt for an explicit close button.
- **Explicit "back"/"cerrar" control always present too** — even
  though click-outside works, every popup/modal also has a visible
  back/close control. Redundant on purpose — don't rely on only one
  way out.
- **Sidebar is collapsible** — a hamburger-style toggle hides/shows it,
  so screens can go full-width when he wants more room.
- **Popup vs. full screen — a deliberate choice per action, not
  default-to-one:**
  - **Popup:** add/edit Client, Supplier, Employee; add a segment/
    subsegment; log an expense (quick-add); edit a single expense;
    revise a project's price; any delete confirmation
  - **Full screen:** a project's overview page (segments, expenses,
    requests, notes all live inside it); the dashboard; a directory
    record's detail view
- **Harmony across windows/tabs/screens** — the same kind of action
  should look and behave the same way everywhere it appears. E.g. "add
  new X" always opens the same style of popup with the same button
  placement, whether X is a client, a segment, or an expense — he
  shouldn't have to relearn the pattern per screen.

## Interaction conventions (apply everywhere, non-negotiable)

- **Click outside to close** — any dropdown, popover, or modal closes
  automatically when clicking outside its bounds. No dead zones where
  the rest of the screen is unresponsive until you find a specific
  "close" button.
- **Sidebar is collapsible** — a hamburger/menu icon hides and reveals
  it. Especially matters on smaller screens.
- **Always a visible "back" / "close" control** — even though clicking
  outside also works, every dialog/panel has an explicit button too.
  Two ways out, always.
- **Popups/modals over full-screen navigation, by default** — quick
  actions (add/edit a record, log an expense) should feel like a
  layer on top of where he already is, not a full page navigation that
  loses his place. Full-screen views are reserved for things that
  genuinely need the whole screen (e.g. the segment tree itself, a
  project overview) — not for quick data entry.

---

## Screen 1 — App shell / navigation

- **Layout:** [sidebar? top bar? collapsible? fixed?]
- **What's always visible, no matter what screen you're on:**
  [quick-add button? search? current project context?]
- **How does he know where he is / how to get back?**
  [breadcrumbs? highlighted nav? project name persists in header?]

---

## Screen 2 — Segment tree (Segments / Subsegments / Sub-subsegments)

This is the core structural idea of the app — think hard about how this
should actually look and behave, not just "a nested list."

- **Visual form:** Collapsible indented tree (file-explorer style), not
  breadcrumb drill-down — siblings need to stay visible so he can see
  the shape of the whole cost breakdown at once.
- **How deep can he see at once:** Whole tree expanded by default, all
  levels. Each node individually collapsible so a "done" section can
  be tucked away without hiding the rest.
- **Adding a subsegment:** Inline — a small "+" next to any segment
  opens the add-segment popup pre-filled with that segment as parent.
  Never a separate "go create a segment" flow.
- **Spend visible without leaving the tree:** Inline number next to
  every segment's name, always on — never hidden behind an expand
  action. This is a money app; the number is the point.
- **Reordering/reparenting:** Keep the existing "move to" picker
  (already correctly prevents cycles). No drag-and-drop for v1 — nice
  to have, not essential, real build cost for marginal gain.

---

## Screen 3 — Expense capture (highest priority — get this right)

- **Trigger:** Always-visible button in the sidebar ("+ Gasto rápido"),
  same one from Slice 3, kept as-is — the trigger placement was
  already right, it's the dialog's look that needs redoing.
- **Steps to log one expense, in order:**
  1. Project (pre-filled if already inside a project)
  2. Segment (defaults to last-used for that project)
  3. Amount
  4. Save — everything else optional/collapsed
- **Defaults to cut steps:** last project used this session, and that
  project's most-recently-used segment — already built correctly in
  Slice 3, keep this logic.
- **After saving:** Popup stays open with a fresh blank form ready for
  the next entry, plus a small running list at the bottom of this
  session's just-logged expenses ("✓ 3 gastos registrados" with a
  one-line summary each). This directly fixes the Slice 3 regression —
  rapid multi-entry shouldn't cost a reopen click each time.
- **Receipt photo:** Both — an optional attach button during capture,
  and also addable later from the expense's own record (edit popup).

---

## Screen 4 — Project overview

- **First thing visible:** Spend vs. price (the number he cares most
  about) at the very top, segment tree directly below it, recent
  activity (last few expenses/notes) below that.
- **"Add expense" prominence:** A persistent button at the top of the
  project page itself, not just the global sidebar one — since being
  inside a project is exactly when he's most likely to log something
  for it.

---

## Screen 5 — Directory (Clientes / Proveedores / Personal)

- **List view columns:** Name, phone, active-projects count (already
  built) — keep it lean, this is a lookup list, not a report.
- **Jump to everything linked:** Yes — clicking a directory record
  opens its full-screen detail view showing every project it's linked
  to, and (for suppliers) every expense tied to it, not just a name and
  phone number in isolation.

---

## Screen 6 — Dashboard

- **Top things visible immediately, ranked:**
  1. Active projects with spend-vs-price at a glance
  2. Open requests count/list
  3. Recent activity feed (latest expenses/notes across all projects)
- **Where he logs expenses from:** Both — global quick-add is reachable
  from the dashboard same as anywhere, but he'll likely go into a
  project first out of habit once one is open often. Don't force either
  path.

---

## Screen 7 — Search / "find anything"

- **Search style:** One global search box, always reachable (lives in
  the app shell, not per-section) — matches "easy to find" principle
  directly.
- **What a result shows:** Full context, not a bare match — a matching
  expense shows its project + segment path inline in the result, not
  just the amount, so he never has to click through blind to know if
  it's the right one.

---

## Visual style

- **Color/mood:** Keep the current green — it already reads
  construction/earth-toned appropriately, no reason to redo brand
  color as part of this pass.
- **Density:** Lean toward compact/information-dense — he's scanning
  numbers and lists, not reading prose; whitespace-heavy "app" styling
  would actually work against fast scanning.
- **Reference points:** None specified yet — open question.
