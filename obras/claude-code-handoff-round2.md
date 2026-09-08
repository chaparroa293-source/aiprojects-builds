Follow-up UI pass after the last rebuild (390b492). I've written feedback 
from hands-on use: ui-ux-round2-feedback.md, placed at 
~/Dev/aiprojects-builds/obras/ui-ux-round2-feedback.md. Read it in full 
before changing anything.

Before writing any code:
1. Read ui-ux-round2-feedback.md in full
2. Summarize back your understanding of all five "ready to build now" 
   items, in particular item #4 (Gasto rápido chip redesign) and item 
   #5 (the add button becoming a universal entry point) — describe 
   concretely how these two relate: is item #5 a new first step in 
   front of item #4's flow, or a separate button? Say which, and why.
3. Confirm you understand the "parked" section is informational only — 
   do NOT build anything related to Sprints/phases. It's documented for 
   a future decision, not part of this pass.
4. Flag anything ambiguous, especially around segment chip selection 
   given segments can be nested 3+ levels deep — how should that work 
   as flat tappable chips rather than a dropdown?

Wait for my confirmation before changing code.

Once confirmed, build all five items:

1. Proyectos list: table → card grid
2. Directory: replace "Proyectos activos" count with the actual list of 
   linked project names; for Personal (Employees), add total paid to 
   date wherever cost association exists, mirroring how supplier spend 
   already works
3. Add "Historial" as its own nav item alongside Proyectos, listing 
   finished/archived projects as a real section — not a hidden query 
   param behind a small link
4. Gasto rápido: replace all three dropdowns (Proyecto, Segmento, 
   Proveedor) with visual tappable chip/button pickers. Monto stays a 
   plain number input. This should feel like fast, visual selection, 
   not a form — same spirit as the existing quick-add's speed, just 
   without the dropdown UI.
5. The sidebar's main add button becomes a universal entry point, not 
   expense-only: first step is "what are you adding?" (Gasto, Cliente, 
   Proveedor, Personal, Proyecto, Segmento as chips/buttons), which 
   routes into that thing's existing add flow. Gasto stays the fastest/
   most prominent option since it's used most — this must not add a 
   step or slow down expense capture for the common case.

Do NOT touch: Prisma schema, server actions/data logic, validation 
rules, or anything related to Sprints/phases (parked, out of scope for 
this pass). This is presentation-layer only, same as last time.

When done, give me a hand-test list like before.
