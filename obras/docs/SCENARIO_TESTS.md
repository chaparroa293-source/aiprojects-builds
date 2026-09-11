# Obras — Scenario Testing

**Classification: VERIFICATION EVIDENCE — scenario design.** This is the
current reusable test-design baseline for the committed operational core. It
does not define product semantics; `../TECHNICAL_SPEC.md` and executable
schema/code do. It is retained alongside results so later runs use the same
realistic situations and fixture rules.

## Purpose and baseline

This is the scenario-testing design for the current `main` baseline of
Obras. It tests operational sequences against **disposable local data**;
it does not describe a production test plan.

The system under test is the committed operational core: projects,
recursive segments, expenses, price revisions, clients, suppliers,
personnel, directory links, Universal Add / Quick Capture, project detail,
History, Panel, global search, and the shared-password gate. Requests,
Notes, Attachments, generic Tasks, named-account attribution, forecasting,
and multi-firm operation are not claimed capabilities. A realistic need for
one of those concepts is evidence of a possible product gap, not an
automatic defect.

Authoritative behavior comes from `../TECHNICAL_SPEC.md`, the Prisma schema
and migrations, and current Server Actions. The README deployment/build
mismatch is recorded technical debt and is outside local scenario execution.

## Testing philosophy

Each scenario is a chronological work situation, rather than an isolated
CRUD check. It asks whether Obras can represent the situation; whether the
workflow is natural; whether relationships and stored rows are correct;
whether money derivations and guards hold; whether a reload preserves the
state; and whether the engineer can retrieve and understand the result
later.

Record observed evidence before classifying a result. A missing capability is
not a failure merely because it is missing. It becomes a `PRODUCT GAP` only
when the scenario establishes a concrete operational need that the current
model cannot serve.

### Finding taxonomy

| Classification | Meaning |
| --- | --- |
| `MODEL` | The domain model cannot correctly represent a realistic situation. |
| `WORKFLOW` | The model supports it, but completing it is impractical, misleading, or unnatural. |
| `INVARIANT` | A state violating an established domain rule is permitted. |
| `PERSISTENCE` | Stored information is lost, corrupted, unexpectedly changed, or wrongly related. |
| `DERIVATION` | A financial, status, or portfolio calculation is wrong. |
| `RETRIEVAL` | Information exists but cannot reasonably be found or understood later. |
| `UX` | The operation works but is confusing, hidden, ambiguous, or error-prone. |
| `SCALE` | A flow/view becomes materially ineffective at realistic data density. |
| `TECHNICAL` | Runtime, database, Server Action, validation, auth, build, or infrastructure behavior fails. |
| `DOCUMENTATION` | Current implementation conflicts with authoritative documentation. |
| `PRODUCT GAP` | A demonstrated workflow needs an intentionally unimplemented capability. Record the need; do not prescribe a feature. |

## Synthetic workspace: Estudio Litoral

All names, RUCs, phones, and figures below are fictional. Prefix every
created test record with `OBR-TST` (for example, `OBR-TST Casa Rivas`) so it
is distinguishable from any pre-existing local data.

### Directory

| Type | Synthetic records |
| --- | --- |
| Clients | Marta Rivas (RUC 80123456-7), Cooperativa San Blas (RUC 80098765-4), Diego Benítez (RUC 80111222-3), Inmobiliaria Ñandutí S.A. (RUC 80044556-1), Lucía Gómez (RUC 80177889-0) |
| Suppliers | Materiales Ybycuí, Hormigón Central, Aceros Guaraní, ElectroSur, Sanitarios del Este, Transporte Mbarete, Pinturas Itá |
| Personnel | Juan Duarte (albañil), Rosa Amarilla (arquitecta técnica), Miguel Benítez (electricista), Carla Villalba (plomera), Sergio Rojas (capataz), Elena Vera (administración) |

### Projects and intended data shape

| Project | Client | Price | State | Segments / use |
| --- | --- | ---: | --- | --- |
| `OBR-TST Casa Rivas` | Marta Rivas | ₲ 485.000.000 | Active | Obra gruesa > Cimientos > Excavación; Obra gruesa > Estructura; Instalaciones > Eléctrica; Terminaciones. Main repeated-capture project. |
| `OBR-TST Depósito San Blas` | Cooperativa San Blas | ₲ 920.000.000 → ₲ 1.040.000.000 | Active | Movimiento de suelo; Estructura > Losa; Cerramientos. Price-revision and large-spend case. |
| `OBR-TST Reforma Benítez` | Diego Benítez | ₲ 178.000.000 | Active | Demoliciones; Baños > Sanitarios; Baños > Revestimientos. Evolving structure. |
| `OBR-TST Local Ñandutí` | Inmobiliaria Ñandutí S.A. | ₲ 630.000.000 | Finished | Fundaciones; Estructura; Instalaciones. Historical retrieval case. |
| `OBR-TST Quincho Gómez` | Lucía Gómez | ₲ 115.000.000 | Archived | Estructura; Techo; Pintura. Retention/history case. |
| `OBR-TST Galpón Norte` | Cooperativa San Blas | ₲ 1.350.000.000 | Active | Preparación; Estructura > Columnas; Estructura > Cubierta; Seguridad. Density and portfolio case. |
| `OBR-TST Anteproyecto Rivas` | Marta Rivas | ₲ 72.000.000 | Active, no expenses | Relevamiento. Safe-delete contrast. |

Planned expense variation includes supplier-linked and supplier-less entries,
small daily purchases, a ₲ 238.500.000 concrete/steel entry, expenses on a
parent and a nested segment, and one intentionally over-budget project only
if created as part of the relevant scenario. Project links should reuse
suppliers and personnel across more than one obra. `Local Ñandutí` is finished
but not archived; `Quincho Gómez` is archived and retains its financial rows.

## Evidence protocol for future execution

For each scenario, retain only non-secret evidence:

| Evidence | Safe execution method |
| --- | --- |
| UI state | Screenshot or concise observation at the relevant route, including visible labels/errors and selected chips. |
| Database state | Local-only read query against the verified disposable database. Check IDs, FKs, statuses, archive timestamps, price revisions, and aggregate totals; never print `DATABASE_URL`. |
| Derived state | Independently sum relevant local expense rows and compare to project, segment, supplier, and Panel displays. |
| Reload state | Fresh browser reload or new local browser tab, then revisit the route. Do not treat in-memory session-log UI as durable history. |
| Guard result | Capture the blocked action’s visible message and confirm database rows/counts did not change. |
| History/retrieval | Navigate through History, directory detail, project detail, and/or global search and record whether the relevant context is understandable. |

## Scenario suite

### TIER 1 — CORE SURVIVAL

#### OBR-SCN-001 — Establish an active obra from incomplete early information

- **Family / tier:** Core project lifecycle / Tier 1.
- **Purpose:** Confirm a project can begin with no client, then receive a client and initial cost structure without losing its identity.
- **Initial state:** Empty or controlled local baseline; `OBR-TST Casa Rivas` client exists but is not yet selected.
- **Objects:** Project, Client, Segment, PriceRevision.
- **Actions:** Create `OBR-TST Casa Rivas` with its agreed price and no client; create root segments; add Cimientos under Obra gruesa and Excavación under Cimientos; edit the project to assign Marta Rivas; reload project detail.
- **Expected UI:** Project opens after creation, is visible in Proyectos as Activo, and displays the nested segment tree and assigned client.
- **Expected persisted state:** One project with nullable-then-set `clientId`; same project ID throughout; parent IDs form the specified tree; no PriceRevision for initial price.
- **Expected derived state:** Spend is ₲ 0; difference equals ₲ 485.000.000; segment totals are ₲ 0.
- **Invariants:** Project may have no client; initial price is not a revision; child segments belong to the same project.
- **Reload/retrieval:** Reload project detail and find it through Proyectos and global search.
- **PASS:** All stated state is present and understandable after reload.
- **Failure signals:** Client assignment silently creates another project, a tree relationship is wrong, or initial price appears as a revision.
- **Likely classification:** `PERSISTENCE`, `INVARIANT`, `RETRIEVAL`, or `UX`.

#### OBR-SCN-002 — Repeated global Quick Capture on one segment

- **Family / tier:** Expense capture / Tier 1.
- **Purpose:** Test the daily high-frequency path and its session defaults.
- **Initial state:** Casa Rivas exists with Cimientos > Excavación and Materiales Ybycuí in the supplier directory.
- **Objects:** Expense, Project, Segment, Supplier.
- **Actions:** From a non-project page open `+ Agregar`; enter three expenses to Casa Rivas/Excavación: ₲ 850.000 with supplier, ₲ 420.000 without supplier, and ₲ 1.250.000 with supplier; leave the popup open between saves; reload the project.
- **Expected UI:** Gasto is preselected; chip choices identify project/segment; amount clears after each save; session log lists three entries and ₲ 2.520.000; supplier remains optional.
- **Expected persisted state:** Three Expense rows with the same project/segment; only two have `supplierId`; each has a positive integer amount.
- **Expected derived state:** Excavación, Cimientos, Obra gruesa, and project spend all increase by ₲ 2.520.000.
- **Invariants:** Every expense has one valid project and segment; no unsegmented row exists.
- **Reload/retrieval:** After reload, recent activity displays the entries and their segment paths; session log itself need not persist.
- **PASS:** Three correct rows and matching rollups appear after reload.
- **Failure signals:** A save duplicates/loses an entry, amount remains stale, supplier-less entry is rejected, or rollups differ.
- **Likely classification:** `WORKFLOW`, `PERSISTENCE`, `DERIVATION`, or `UX`.

#### OBR-SCN-003 — Capture from project context and correct an entry

- **Family / tier:** Expense capture / Tier 1.
- **Purpose:** Confirm project-locked capture, allowed expense edits, and immutable project association.
- **Initial state:** Casa Rivas has Instalaciones > Eléctrica and an earlier Excavación expense.
- **Objects:** Expense, Project, Segment, Supplier.
- **Actions:** Open Casa Rivas and use `+ Registrar gasto`; record ₲ 3.400.000 against Eléctrica and ElectroSur; edit its amount to ₲ 3.650.000 and description; attempt to use edit controls to move it to another project if a control exists.
- **Expected UI:** Project is fixed in project-context capture; edit exposes allowed fields, not a project picker.
- **Expected persisted state:** One added expense remains on Casa Rivas/Eléctrica; amount and description update; no second row or cross-project move occurs.
- **Expected derived state:** Casa Rivas and Eléctrica rise by ₲ 3.650.000, replacing—not adding to—the original value.
- **Invariants:** Expense project cannot change during edit.
- **Reload/retrieval:** Reload Casa Rivas; retrieve through recent expenses and supplier detail.
- **PASS:** Corrected row and replaced totals persist; project reassignment is unavailable or blocked.
- **Failure signals:** Edit creates a duplicate, changes the project, or totals retain the old amount.
- **Likely classification:** `INVARIANT`, `PERSISTENCE`, `DERIVATION`, or `UX`.

#### OBR-SCN-004 — Price revision changes the comparison, not recorded spend

- **Family / tier:** Financial integrity / Tier 1.
- **Purpose:** Separate contract-price history from expense history.
- **Initial state:** Depósito San Blas has ₲ 920.000.000 agreed price, segments, and controlled expenses.
- **Objects:** Project, PriceRevision, Expense.
- **Actions:** Record expenses totaling ₲ 190.000.000; revise the agreed price to ₲ 1.040.000.000 with a reason; attempt a same-value revision; reload.
- **Expected UI:** Price history displays the old/new values and reason; same-value change shows a validation error.
- **Expected persisted state:** One PriceRevision with old/new values and reason; project current price is ₲ 1.040.000.000; expense rows are unchanged.
- **Expected derived state:** Spend stays ₲ 190.000.000; difference becomes ₲ 850.000.000; percentage uses the revised price.
- **Invariants:** Initial price has no revision; no-op revision is rejected; revision and current price agree.
- **Reload/retrieval:** Reopen project and price history after reload.
- **PASS:** One durable revision, unchanged expenses, correct new comparison.
- **Failure signals:** A no-op revision exists, spend changes, or history/current price disagree.
- **Likely classification:** `INVARIANT`, `PERSISTENCE`, `DERIVATION`, or `RETRIEVAL`.

#### OBR-SCN-005 — Preserve financial history by archiving rather than deleting

- **Family / tier:** Project retention/history / Tier 1.
- **Purpose:** Test the principal financial-retention guard.
- **Initial state:** Quincho Gómez has at least one expense and its segment tree.
- **Objects:** Project, Expense, Segment.
- **Actions:** Attempt to delete the project; record the guard response; archive it; navigate to History and open it; reload.
- **Expected UI:** Deletion is blocked with expense count/total context; archive removes it from active Proyectos and puts it in Archivados.
- **Expected persisted state:** Project, expenses, and segments remain; `archivedAt` is populated.
- **Expected derived state:** Historic spend/price comparison remains intact; archived project is excluded from active Panel totals and Quick Capture project options.
- **Invariants:** Financial project cannot be hard-deleted.
- **Reload/retrieval:** Find the project in History and read its expense data after reload.
- **PASS:** Guard prevents deletion and archive preserves readable history.
- **Failure signals:** Project or financial rows disappear, remains active in capture/panel, or cannot be found later.
- **Likely classification:** `INVARIANT`, `PERSISTENCE`, `DERIVATION`, or `RETRIEVAL`.

#### OBR-SCN-006 — Portfolio snapshot agrees with active project data

- **Family / tier:** Financial integrity / Tier 1.
- **Purpose:** Verify Panel is a read-only aggregate of active, non-archived obras.
- **Initial state:** At least Casa Rivas, Depósito San Blas, Reforma Benítez, Galpón Norte active; Local Ñandutí finished; Quincho Gómez archived.
- **Objects:** Project, Expense, Panel.
- **Actions:** Independently total the active projects’ agreed prices and expenses from the local database; open Panel; follow a recent expense to its project; reload.
- **Expected UI:** Panel lists active projects only, reports active count, recorded spend, recorded margin, percentage, and recent expense context.
- **Expected persisted state:** Read-only scenario: no rows change.
- **Expected derived state:** Panel spend = sum active project expenses; agreed = sum active prices; margin = agreed − spend; finished/archived projects excluded.
- **Invariants:** Panel does not mutate data and uses the active portfolio definition.
- **Reload/retrieval:** Reload Panel and navigate from a recent item to the correct project.
- **PASS:** Independent sums match exactly and navigation context is correct.
- **Failure signals:** Finished/archived spend appears in Panel totals, margin is presented as actual profit, or item links are wrong.
- **Likely classification:** `DERIVATION`, `RETRIEVAL`, `UX`, or `DOCUMENTATION`.

### TIER 2 — REALISTIC COMPLEXITY

#### OBR-SCN-007 — Reorganize a live segment tree without changing money

- **Family / tier:** Segment hierarchy / Tier 2.
- **Purpose:** Test a cost breakdown evolving after expenses exist.
- **Initial state:** Reforma Benítez has expenses on Baños and on Baños > Sanitarios; a new root `Instalaciones` exists.
- **Objects:** Segment, Expense, Project.
- **Actions:** Rename Baños to `Sanitarios y baños`; move Sanitarios beneath Instalaciones; attempt to move the parent beneath its former child; reload.
- **Expected UI:** Rename/move controls clarify target selection; cyclic move is rejected with an understandable message.
- **Expected persisted state:** Same segment IDs and expense IDs; only permitted parent/name fields change.
- **Expected derived state:** Total project spend stays unchanged; old and new ancestors’ rollups update according to the new tree.
- **Invariants:** No self-parenting, descendant cycle, or cross-project parent.
- **Reload/retrieval:** Reload tree and expense list; paths use the new hierarchy.
- **PASS:** Tree changes safely; total money remains constant; cycle is blocked.
- **Failure signals:** Expense loss, duplicate spend, stale paths, or accepted cycle.
- **Likely classification:** `INVARIANT`, `PERSISTENCE`, `DERIVATION`, or `UX`.

#### OBR-SCN-008 — Segment deletion guards distinguish empty from financially used structure

- **Family / tier:** Segment hierarchy / Tier 2.
- **Purpose:** Exercise both guarded and allowable deletion.
- **Initial state:** Casa Rivas has an empty `Terminaciones` root; Cimientos has child Excavación with expenses.
- **Objects:** Segment, Expense.
- **Actions:** Delete empty Terminaciones; attempt to delete Cimientos; attempt to delete Excavación; reload.
- **Expected UI:** Empty segment deletes; blocked attempts state whether children and/or expenses prevent deletion.
- **Expected persisted state:** Terminaciones gone; Cimientos and Excavación plus expenses unchanged.
- **Expected derived state:** Project total unchanged; removal of zero-value Terminaciones changes no financial figure.
- **Invariants:** A segment with children or expenses is not deletable.
- **Reload/retrieval:** Reload the project tree and confirm no ghost nodes.
- **PASS:** Only the safe empty node is deleted.
- **Failure signals:** A guarded node disappears, a financial row is cascaded, or a deleted node still renders.
- **Likely classification:** `INVARIANT`, `PERSISTENCE`, `DERIVATION`, or `TECHNICAL`.

#### OBR-SCN-009 — Shared supplier remains useful after a directory cleanup

- **Family / tier:** Directory relationships / Tier 2.
- **Purpose:** Validate supplier reuse, explicit links, expense-derived links, and supplier deletion behavior.
- **Initial state:** Materiales Ybycuí is linked to Casa Rivas and Depósito San Blas and has expenses on both; a disposable `OBR-TST Proveedor temporal` has one expense.
- **Objects:** Supplier, ProjectSupplier, Expense, Project.
- **Actions:** Inspect Materiales Ybycuí detail and supplier search; delete the temporary supplier from its directory detail; inspect its former expense, project totals, and project links; reload.
- **Expected UI:** Shared supplier lists projects and per-project/total spend. Temporary supplier deletion is allowed; former expense remains readable with no supplier.
- **Expected persisted state:** Temporary supplier row and its project links are removed; associated expense remains with `supplierId = null`; amounts/project/segment are unchanged.
- **Expected derived state:** Project totals unchanged; deleted supplier cannot contribute a supplier total; surviving suppliers retain their own totals.
- **Invariants:** Directory deletion does not destroy financial history.
- **Reload/retrieval:** Find preserved expense via project activity; confirm deleted supplier no longer appears in directory/search.
- **PASS:** Financial row survives exactly once and shared supplier information remains correct.
- **Failure signals:** Expense deletion, changed amount/segment/project, orphaned broken UI, or duplicate supplier-project accounting.
- **Likely classification:** `PERSISTENCE`, `INVARIANT`, `DERIVATION`, or `RETRIEVAL`.

#### OBR-SCN-010 — Personnel and supplier associations reflect operational team changes

- **Family / tier:** Directory relationships / Tier 2.
- **Purpose:** Test reusable firm-wide relationships independent from spend.
- **Initial state:** Personnel and suppliers exist; Casa Rivas and Galpón Norte are active.
- **Objects:** Employee, Supplier, ProjectEmployee, ProjectSupplier.
- **Actions:** Link Miguel Benítez and Sergio Rojas to both projects; link Aceros Guaraní to Galpón Norte before any expense; unlink Sergio from Casa Rivas; inspect project and directory details; reload.
- **Expected UI:** Project team chips reflect additions/removal; directory shows linked project names.
- **Expected persisted state:** Unique association rows exist where intended; removed link is absent; no expense is created by a link operation.
- **Expected derived state:** Personnel has no spend figure; supplier link alone creates no spend.
- **Invariants:** Links are unique; associations are non-financial metadata.
- **Reload/retrieval:** Reopen both project and directory pages after reload.
- **PASS:** Associations are accurate, reusable, and do not alter money.
- **Failure signals:** Duplicate links, stale chips, unintended expenses, or spend attributed to personnel.
- **Likely classification:** `PERSISTENCE`, `INVARIANT`, `DERIVATION`, or `UX`.

#### OBR-SCN-011 — Finished project remains historical but leaves the active portfolio

- **Family / tier:** Project retention/history / Tier 2.
- **Purpose:** Test manual completion as an operational state, distinct from archive.
- **Initial state:** Local Ñandutí has spend, price, segments, suppliers, and personnel; it is active at scenario start.
- **Objects:** Project, Expense, PriceRevision, History, Panel.
- **Actions:** Mark Local Ñandutí finished; visit Proyectos, Historial, Panel, global search, and project detail; optionally reactivate it; reload each relevant surface.
- **Expected UI:** It disappears from active Proyectos/Panel, appears under Terminados, remains fully readable and searchable.
- **Expected persisted state:** `status = FINISHED`; no archive timestamp unless explicitly archived; no financial row changes.
- **Expected derived state:** Finished project excluded from active portfolio totals but retains its own totals.
- **Invariants:** Completion is manual and is not inferred from spend/date.
- **Reload/retrieval:** Find through History and search after reload.
- **PASS:** State transition changes only project status and preserves retrieval/history.
- **Failure signals:** Financial data changes, completion auto-triggered, or project becomes inaccessible.
- **Likely classification:** `PERSISTENCE`, `DERIVATION`, `RETRIEVAL`, or `UX`.

#### OBR-SCN-012 — Large expense and overrun communicate a recorded comparison

- **Family / tier:** Financial integrity / Tier 2.
- **Purpose:** Verify guaraní formatting, large integers, overrun display, and language around financial meaning.
- **Initial state:** Galpón Norte price is ₲ 1.350.000.000 with controlled existing spend below price.
- **Objects:** Expense, Project, Segment, Panel.
- **Actions:** Record a ₲ 238.500.000 supplier-linked expense and sufficient additional controlled expenses to exceed the price; inspect project summary and Panel; reload.
- **Expected UI:** Amount accepts/display uses guaraní grouping; project indicates overrun/difference clearly; Panel labels the portfolio figure as recorded margin, not profit.
- **Expected persisted state:** Exact positive `BIGINT` expense values with valid FKs.
- **Expected derived state:** Project spend exceeds price; difference is negative; progress bar is capped visually while numerical state remains exact; active Panel includes the expense.
- **Invariants:** No decimal/negative amount accepted; expense remains assigned to exactly one segment/project.
- **Reload/retrieval:** Reload project and find the amount with exact-amount global search if supported.
- **PASS:** Exact values and comparisons agree across database, project, Panel, and search.
- **Failure signals:** Precision loss, accepted decimal/negative value, incorrect percent/delta, or profit implication.
- **Likely classification:** `DERIVATION`, `PERSISTENCE`, `INVARIANT`, or `UX`.

### TIER 3 — PRODUCT PRESSURE / EDGE CONDITIONS

#### OBR-SCN-013 — Similar directory names and later operational retrieval

- **Family / tier:** Retrieval and operational understanding / Tier 3.
- **Purpose:** Probe disambiguation when normal construction data is similar.
- **Initial state:** Create `OBR-TST San Blas Materiales` and retain `Materiales Ybycuí`; multiple projects share client/supplier relationships and expense descriptions such as `cemento`.
- **Objects:** Client, Supplier, Employee, Expense, Global Search.
- **Actions:** Search partial names, phone fragments, `cemento`, and exact formatted/unformatted amount; navigate each result; inspect context and back-navigation.
- **Expected UI:** Results identify type and relevant context, while expense results identify project and full segment path.
- **Expected persisted state:** Read-only scenario: none changes.
- **Expected derived state:** None beyond displayed contextual amounts.
- **Invariants:** Search cannot reveal records outside the configured firm.
- **Reload/retrieval:** Repeat in a fresh load and confirm results lead to the intended records.
- **PASS:** Engineer can distinguish the intended entity/expense without guesswork.
- **Failure signals:** Missing expected records, ambiguous context that causes realistic misidentification, or wrong links.
- **Likely classification:** `RETRIEVAL`, `UX`, `SCALE`, or `TECHNICAL`.

#### OBR-SCN-014 — High-density active portfolio and chip-picker pressure

- **Family / tier:** Scale / Tier 3.
- **Purpose:** Discover whether current visual selection and summaries remain usable with a plausible amount of live work.
- **Initial state:** Seven projects, 20–30 segments distributed across them, seven suppliers, six personnel, and 35–50 controlled expenses exist in the synthetic workspace.
- **Objects:** Projects, Segments, Expenses, Panel, Universal Add, Global Search.
- **Actions:** Open Universal Add from multiple routes; switch projects and inspect segment chips; open Panel, a dense project detail, History, directory lists, and search; use normal viewport and narrow/tablet viewport where available.
- **Expected UI:** Selections remain possible; project change resets/selects a valid segment; tables/cards remain understandable; sidebar behavior remains usable.
- **Expected persisted state:** Read-only scenario: none changes.
- **Expected derived state:** Independent aggregate checks still match sampled project and Panel totals.
- **Invariants:** A project switch never leaves an invalid segment selected.
- **Reload/retrieval:** Refresh after navigation and ensure selection controls/data remain coherent.
- **PASS:** No incorrect selection, hidden critical information, severe performance blockage, or aggregate drift is observed.
- **Failure signals:** Chip overload prevents practical selection, stale segment selection causes validation/data error, or high density makes retrieval materially ineffective.
- **Likely classification:** `SCALE`, `WORKFLOW`, `UX`, `DERIVATION`, or `TECHNICAL`.

#### OBR-SCN-015 — Site observation and supplier issue with no expense

- **Family / tier:** Messy reality / Tier 3.
- **Purpose:** Determine whether a non-financial follow-up can be represented without pretending current features exist.
- **Initial state:** Casa Rivas is active; a delivery from Materiales Ybycuí is late and site inspection finds a crack requiring follow-up next Tuesday.
- **Objects:** Project, Supplier; deliberately no Request/Note/Task/Attachment object.
- **Actions:** Starting from the relevant project and supplier detail, attempt to record: “Confirm replacement material,” owner/assignee, due date, and a supporting photo/document—using only present UI capabilities. Do not create substitute expense records.
- **Expected UI:** No expectation that an unimplemented feature exists.
- **Expected persisted state:** No fabricated expense, segment, or price revision should be created merely to retain the information.
- **Expected derived state:** No financial effect.
- **Invariants:** Financial records must not be misused as generic notes/tasks.
- **Reload/retrieval:** If no legitimate representation exists, record the exact point of workflow loss rather than forcing one.
- **PASS:** The scenario yields clear evidence of either a supported legitimate workflow or a bounded unmet need.
- **Failure signals:** User must falsify financial data to remember the issue, or existing UI misleadingly suggests persistence when none occurs.
- **Likely classification:** `PRODUCT GAP`, `MODEL`, `WORKFLOW`, or `UX`.

#### OBR-SCN-016 — Receipt/photo and late information pressure

- **Family / tier:** Messy reality / Tier 3.
- **Purpose:** Test the boundary between expense attribution and missing attachment/document retention.
- **Initial state:** A real supplier invoice for Casa Rivas must be logged quickly; photo/document and invoice reference arrive later.
- **Objects:** Expense, Supplier; deliberately no Attachment object.
- **Actions:** Capture the expense correctly with project, segment, supplier, amount, and optional description. Later attempt to add/retrieve a receipt image/document and invoice evidence without placing files or links in unrelated fields.
- **Expected UI:** Expense capture remains viable without an attachment; no attachment capability is assumed.
- **Expected persisted state:** Correct expense exists; no unsupported file metadata is invented.
- **Expected derived state:** Expense affects the expected project/segment/supplier totals only.
- **Invariants:** Financial facts remain valid even where supporting evidence cannot yet be stored.
- **Reload/retrieval:** Retrieve the expense and record whether its later supporting document can be associated legitimately.
- **PASS:** Correct expense persistence plus a precise statement of any documentation-retention need.
- **Failure signals:** A user needs to encode a file as a fake expense/note, or loses operational evidence without any discoverable boundary.
- **Likely classification:** `PRODUCT GAP`, `WORKFLOW`, `RETRIEVAL`, or `UX`.

#### OBR-SCN-017 — Change request arrives before financial impact is agreed

- **Family / tier:** Messy reality / Tier 3.
- **Purpose:** Distinguish a client change request from an agreed price revision.
- **Initial state:** Depósito San Blas has active work and a previously recorded price revision. Client asks for an additional loading bay; cost and agreement are not yet approved.
- **Objects:** Project, PriceRevision; deliberately no Request/Note object.
- **Actions:** Attempt to record the client request and its pending status without revising the agreed price or creating an expense. Once considering a hypothetical later agreement, identify the current legitimate operation (price revision) but do not execute it in this scenario.
- **Expected UI:** Price revision is not presented as a generic request log.
- **Expected persisted state:** No price revision or financial row for an unagreed change.
- **Expected derived state:** Existing price/spend totals remain unchanged.
- **Invariants:** A price revision represents an actual agreed-price change, not a pending request.
- **Reload/retrieval:** Record whether the pending change can later be found without corrupting financial history.
- **PASS:** Clear separation between supported agreed-price history and unsupported pending-work tracking.
- **Failure signals:** Workflow encourages premature financial change or forces false data.
- **Likely classification:** `PRODUCT GAP`, `MODEL`, `WORKFLOW`, or `UX`.

## Recommended execution order

Execute Tier 1 first, in this order:

1. `OBR-SCN-001` — establish Casa Rivas and its tree.
2. `OBR-SCN-002` — repeated global expense capture.
3. `OBR-SCN-003` — project-context capture and correction.
4. `OBR-SCN-004` — price revision.
5. `OBR-SCN-005` — archive/deletion guard.
6. `OBR-SCN-006` — Panel reconciliation.

Only advance when the previous scenario has a recorded result. A failed
scenario is evidence, not permission to alter the application during the
test run.

## Result record template

```md
### OBR-SCN-XXX — <name>

Result: PASS | PASS WITH FINDING | FAIL | BLOCKED

Observed behavior:
Expected behavior:

UI state:
Persistence verification:
Derived-state verification:
Reload verification:
Guard result:
History/retrieval verification:

Findings:
- Finding ID: OBR-FND-XXX
  Classification: MODEL | WORKFLOW | INVARIANT | PERSISTENCE | DERIVATION | RETRIEVAL | UX | SCALE | TECHNICAL | DOCUMENTATION | PRODUCT GAP
  Severity: Critical | High | Medium | Low
  Evidence:
  Expected:
  Actual:
  Potential impact:
```

`PASS WITH FINDING` means the scenario’s required behavior worked but exposed
a separately documented usability, retrieval, scale, or product-pressure
finding. Do not turn a finding into a fix in the test record.

## OBR-TEST-002 local safety plan

1. **Confirm locality without exposing a secret.** Read the effective local
   `DATABASE_URL` only through a redacted parser and report host, port,
   database name, and whether it is loopback/local. Stop if it is not clearly
   the intended local disposable database. Never print credentials or the URL.
2. **Confirm the target before mutation.** Verify a local Postgres process or
   Docker container corresponds to that target and that no Preview/Production
   hostname is involved. Do not rely on the existence of `.env` alone.
3. **Establish the baseline.** Apply only committed Obras migrations to the
   confirmed local database, then use a recorded test-run identifier and
   `OBR-TST` prefixes. Before reset/seeding, inspect current local row counts
   and obtain confirmation if any non-synthetic data exists.
4. **Preserve/reset safely.** Prefer a dedicated empty local database or
   database volume for this run. If cleanup is authorized, delete only rows
   bearing the test-run prefix, in dependency order, and verify counts after;
   never issue broad destructive commands or touch another database.
5. **Run locally.** Start Obras only from `obras/`, with the verified local
   environment. Use the shared-password configuration currently on `main`;
   do not invoke the named-accounts branch.
6. **Inspect persistently.** Use read-only local SQL queries for scenario
   verification, keeping credentials and secret values out of terminal output
   and reports.
7. **Protect boundaries.** Do not use Vercel, Neon Preview, Production,
   deployment commands, or parent-repository services. Do not edit unrelated
   parent projects or the root untracked files.
8. **Stop conditions.** Stop and report `BLOCKED` if the URL target cannot be
   established as local/disposable, if existing local data cannot safely be
   distinguished, or if migration/reset would risk another environment.

## OBR-TEST-002 proposed scope

The smallest execution checkpoint is Tier 1 through `OBR-SCN-003` only:
verify the local database target; create the minimal Casa Rivas fixture;
execute global repeated capture and project-context correction; collect UI,
database, rollup, and reload evidence; and leave all later scenarios,
cleanup, deployment, and product changes untouched until results are reviewed.
