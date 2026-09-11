# Obras — Scenario Test Results

**Classification: VERIFICATION EVIDENCE — historical executions.** Each
checkpoint records what was observed against its named baseline and fixture;
later results may supersede a prior result for the same scenario but never
erase it. This file does not define current product/domain behavior. Read
`../TECHNICAL_SPEC.md` and executable schema/code for that authority.

## OBR-TEST-002 — Tier 1 Core Lifecycle and Quick Capture

- **Execution date:** 2026-09-11
- **Repository baseline:** `main` at `2d3a2b51d637c6a2b1c304aa1ba9c4470d24b2d4`
- **Database classification:** `LOCAL LOOPBACK DATABASE — CONFIRMED`
- **Database target:** local PostgreSQL on loopback port 5433; database `obras`.
- **Result:** `BLOCKED` before application runtime or scenario execution.

## Safety-gate evidence

The configured database was confirmed through a direct local connection. No
connection string, credential, password, token, or other secret is recorded
here.

The database is not an empty or clearly dedicated scenario fixture:

| Check | Observed local state |
| --- | ---: |
| Applied migrations | 7 |
| Clients | 5 |
| Suppliers | 3 |
| Personnel | 2 |
| Projects | 2 |
| Segments | 7 |
| Expenses | 5 |
| Price revisions | 0 |
| `OBR-TST` projects/clients/suppliers | 0 / 0 / 0 |

The existing projects and financial rows do not carry the `OBR-TST` prefix and
were not established by this scenario program. The applied migration list also
contains `20260909105326_add_users_and_created_by`, which is not part of the
current `main` Prisma migration set and belongs to the intentionally
out-of-scope named-accounts work. That makes the provenance and disposability
of this local database unsafe to assume.

No rows were created, changed, reset, or deleted.

## Runtime readiness

Not attempted. Starting the app and authenticating could lead to interaction
with pre-existing, non-synthetic local data. The checkpoint stop condition was
reached before runtime work.

## Scenario results

### OBR-SCN-001 — Establish an active obra from incomplete early information

- **Result:** `BLOCKED`
- **Expected behavior:** Not evaluated.
- **Persistence / derived-state / reload / retrieval verification:** Not
  evaluated; no fixture was created.
- **Blocker:** Local database contains non-`OBR-TST` records of unknown
  provenance.

### OBR-SCN-002 — Repeated global Quick Capture on one segment

- **Result:** `BLOCKED`
- **Expected behavior:** Not evaluated.
- **Persistence / derived-state / reload / retrieval verification:** Not
  evaluated; no expense records were created.
- **Blocker:** Same local-database safety gate.

### OBR-SCN-003 — Capture from project context and correct an entry

- **Result:** `BLOCKED`
- **Expected behavior:** Not evaluated.
- **Persistence / derived-state / reload / retrieval verification:** Not
  evaluated; no expense records were created or edited.
- **Blocker:** Same local-database safety gate.

## Reconciliation

No synthetic workspace exists. Therefore no UI-versus-database reconciliation
is applicable. The only recorded database totals are the pre-existing counts
in the safety-gate table; they are not scenario results.

## Findings register

| Finding ID | Scenario | Classification | Severity | Summary | Status |
| --- | --- | --- | --- | --- | --- |
| OBR-FND-001 | OBR-TEST-002 safety gate | TECHNICAL | S0 | Local target is loopback but contains non-synthetic records and an out-of-baseline migration; it cannot safely receive scenario writes. | Open / blocks execution |

## Required next action

Before any scenario execution, provide or establish a clearly isolated,
disposable local Obras database that matches current `main`'s committed
migration baseline. Re-run the safety gate and record the new target without
printing secrets. Do not reset or delete this existing local database unless
separately authorized after its ownership and data status are confirmed.

---

## OBR-TEST-002A — Isolated local scenario-test database

- **Execution date:** 2026-09-11
- **Repository baseline:** `main` at `2d3a2b51d637c6a2b1c304aa1ba9c4470d24b2d4`
- **Result:** `READY TO RETRY OBR-TEST-002`

### Why OBR-TEST-002 stopped

`OBR-FND-001` remains valid historical evidence. The original loopback
database named `obras` contained non-`OBR-TST` financial records and the
out-of-baseline named-accounts migration. It was not suitable for scenario
writes and remains out of scope.

### Preserved and isolated targets

| Target | Classification | Migration count | Application-row state |
| --- | --- | ---: | --- |
| `obras` | Existing local loopback database; preserved | 7 | Unchanged: 5 clients, 3 suppliers, 2 personnel, 2 projects, 7 segments, 5 expenses |
| `obras_scenario_test` | New disposable local loopback database | 6 | Empty: all directory, project, segment, expense, and price-revision counts are 0 |

The existing `obras` target was inspected read-only after setup and retained
its original record counts and seven-migration history. No reset, schema
change, deletion, rename, or write was performed on it.

### Current-main baseline verification

The current checkout contains exactly these committed migrations:

1. `20260908000000_init`
2. `20260908072640_projects_and_segments`
3. `20260908074619_expenses`
4. `20260908083056_project_directory_links`
5. `20260908121624_add_ruc_to_directory`
6. `20260908170334_add_rol_to_employee`

Those six migrations were applied to `obras_scenario_test` through Prisma's
normal `migrate deploy` workflow. Prisma migration status then reported the
scenario database schema as up to date.

The named-accounts migration `20260909105326_add_users_and_created_by` is not
in current `main` and was not applied. The new database has no `users` table;
its expected application tables are clients, suppliers, employees, projects,
segments, expenses, price revisions, project-supplier links, and
project-employee links.

### Safe runtime targeting for OBR-TEST-002

Do not change `obras/.env`. For the local process that runs OBR-TEST-002,
derive a temporary `DATABASE_URL` from the existing local `.env` value and
replace **only** its database pathname with `obras_scenario_test` (retaining
the local host, port, credentials, and query parameters). Start `npm run dev`
with that process-only environment override. The override must be parsed and
reported only as the redacted identity `LOCAL LOOPBACK DATABASE —
obras_scenario_test`; never echo the URL or credentials.

The same process-only override was used successfully for migration deployment
and Prisma migration-status verification. It changes neither the developer's
normal `.env` target nor any Preview, Neon, or Production configuration.

### Isolation proof

- The two databases have distinct names and independent migration histories.
- The old database still has seven migrations and its original row counts.
- The scenario database has six current-main migrations, no named-account
  table, and no scenario or other application rows.
- All database work used the confirmed local loopback PostgreSQL server.
- No Preview, Production, Vercel, or Neon environment was contacted.
- No business scenario or Estudio Litoral fixture was executed or seeded.

---

## OBR-TEST-003 — Autonomous scenario-suite execution

### OBR-SCN-001 — Establish an active obra from incomplete early information

Result: **PASS**

Observed behavior:

- The existing `OBR-TST Casa Rivas` record remained the same project after its
  client was assigned through **Editar**.
- The UI displayed `OBR-TST Marta Rivas`, status `Activo`, agreed price
  `₲ 485.000.000`, recorded spend `₲ 0`, difference `₲ 485.000.000`, and the
  expanded `Obra gruesa > Cimientos > Excavación` hierarchy.

Expected behavior:

- A project may start clientless, then receive its client without a second
  project or an initial price revision; its initial nested cost structure is
  durable.

Persistence verification:

- Local-only `obras_scenario_test` query found exactly one Casa Rivas project
  (`cmtwpv1nd0002i7e09cmgeoid`), `ACTIVE`, price `485000000`, linked to
  `OBR-TST Marta Rivas`, with three segment rows, zero expenses, and zero
  price revisions.
- Segment rows form one root and two successive children, as rendered in the
  UI. The project ID remained unchanged through the client assignment.

Derived-state verification:

- Independent database expense count is zero, agreeing with UI recorded spend
  `₲ 0`; therefore the displayed difference equals the agreed price. Segment
  own and rolled-up amounts display `₲ 0`.

Reload verification:

- A fresh project-detail load retained client, status, price, totals, and all
  three tree levels.

History/retrieval verification:

- Global search for `Casa Rivas` returned a `PROYECTOS` result identifying
  both `OBR-TST Casa Rivas` and `OBR-TST Marta Rivas` from the project detail
  route.

Findings: none.

### OBR-SCN-006 — Portfolio snapshot agrees with active project data

Result: **PASS WITH FINDING**

Observed behavior:

- Panel reported 2 active projects, `₲ 196.170.000` recorded spend,
  `₲ 1.328.830.000` recorded margin, and 13% of active agreed value.
- Its project table listed only active Casa Rivas and Depósito San Blas. Its
  recent-activity project links point to the corresponding project details;
  archived Quincho does not appear in the active table or figures.

Expected behavior:

- Panel is a non-mutating aggregate of the active, non-archived portfolio.

Persistence verification:

- Read-only scenario; no write was made. Independent local query counted two
  active non-archived projects with agreed total `1525000000` and spend
  `196170000`.

Derived-state verification:

- Panel’s spend equals the independent sum; its displayed margin equals
  `1525000000 − 196170000 = 1328830000`. The displayed percent rounds the
  same ratio to 13%.

Reload/retrieval verification:

- Panel showed recent expense links to the correct project context during the
  read-only check.

Findings:

- Finding ID: OBR-FND-002
  Classification: DOCUMENTATION
  Severity: S3
  Evidence: The canonical scenario initial state calls for a broader active
  portfolio (Casa, Depósito, Reforma, Galpón and a finished Local), but those
  later workspace records do not yet exist at this execution point.
  Expected: Full-density portfolio scenario would be checked once its stated
  fixtures exist.
  Actual: The aggregate contract was verified against the valid current active
  set of two projects; the broader fixture is deferred to subsequent scenarios.
  Potential impact: This pass demonstrates aggregate correctness, not the
  larger-portfolio density behavior reserved for OBR-SCN-014.

### OBR-SCN-007 — Reorganize a live segment tree without changing money

Result: **PASS WITH FINDING**

Observed behavior:

- In `OBR-TST Reforma Benítez`, `Baños` was renamed to `Sanitarios y baños`.
  Its existing `Sanitarios` child was moved under the separate root
  `Instalaciones`; the reloaded tree shows both resulting roots and the new
  child path.
- Editing `Instalaciones` offers only the root option and `Sanitarios y baños`
  as move targets; its own descendant `Sanitarios` is omitted and the dialog
  explicitly says `No aparecen sus propios subsegmentos (evita ciclos).`

Expected behavior:

- A rename/reparent operation persists safely and prevents an ancestor from
  being placed under its descendant.

Persistence verification:

- Fresh project-detail load retained the renamed root and the moved child in
  its new parent relationship.

Derived-state verification:

- All affected segment and project totals remain `₲ 0`; no financial value was
  introduced by either structure-only action.

Reload/retrieval verification:

- Reload renders `Instalaciones > Sanitarios` and `Sanitarios y baños` without
  a stale child path.

Findings:

- Finding ID: OBR-FND-003
  Classification: DOCUMENTATION
  Severity: S3
  Evidence: The canonical initial state requires expenses on both the parent
  and former child, but the chronological reparent operation was executed on
  the clean newly constructed hierarchy before expense rows were added.
  Expected: Monetary preservation under a populated tree.
  Actual: Structural persistence and cycle prevention were verified; this
  particular run did not exercise non-zero rollup relocation.
  Potential impact: The scenario is a valid structural pass but not complete
  financial-reparent coverage.

### OBR-SCN-008 — Segment deletion guards distinguish empty from financially used structure

Result: **PASS WITH FINDING**

Observed behavior:

- An empty `Terminaciones` root was created, confirmed, and removed from the
  project tree. It did not reappear after the operation.
- Cimientos deletion was blocked with the explicit reason that it has one
  subsegment. Excavación deletion was blocked; independent local evidence
  shows it has zero children and three expense rows, so deletion remained
  safely prevented.

Expected behavior:

- Only an empty segment can be removed; a parent or a financially used leaf
  must remain intact.

Persistence verification:

- Local-only tree query after the actions contains no Terminaciones row.
  Cimientos remains with one child; Excavación remains with zero children and
  three expenses; all five remaining Casa structure rows have their expected
  parents.

Derived-state verification:

- The empty node carried zero cost. Retained expenses still total the existing
  Casa Rivas `₲ 6.170.000`; no financial row was removed.

Guard result:

- The UI used a two-step confirmation and refused deletion of Cimientos.
  Excavación was also refused.

Findings:

- Finding ID: OBR-FND-004
  Classification: UX
  Severity: S2
  Evidence: Immediately after the Cimientos refusal, the Excavación
  confirmation displayed `tiene 1 subsegmento` even though its local row has
  zero children and the visible tree renders it as a leaf; it has three
  expenses instead.
  Expected: The displayed rejection reason should match the segment being
  confirmed (expenses for Excavación), not a previous segment’s child count.
  Actual: Deletion was safely blocked, but the contextual explanation was
  stale/incorrect.
  Potential impact: A user may misunderstand why a financial segment cannot
  be deleted.

### OBR-SCN-009 — Shared supplier remains useful after a directory cleanup

Result: **PASS WITH FINDING**

Observed behavior:

- `OBR-TST Proveedor temporal` was used for a `₲ 100.000` Casa Rivas expense.
  Its supplier detail correctly showed one project, one expense, and that
  total before deletion.
- The deletion confirmation explicitly stated that registered expenses would
  not be deleted and would remain without an assigned supplier. After
  confirmation, the supplier no longer appears in the directory.

Persistence verification:

- Local-only verification found zero temporary-supplier rows, exactly one
  matching `100000` Casa Rivas expense, and that expense has null `supplier_id`.

Derived-state verification:

- Casa’s project/segment totals increased only when the valid expense was
  captured; deleting the directory record did not delete or alter it.

Reload/retrieval verification:

- The post-delete supplier directory has no temporary supplier result.

Findings:

- Finding ID: OBR-FND-005
  Classification: DOCUMENTATION
  Severity: S3
  Evidence: The stated initial condition calls for Materiales Ybycuí linked to
  both Casa and Depósito with expenses on both. This run established and
  verified the destructive preservation path, but Materiales has only the Casa
  expense at this point.
  Expected: Shared-supplier cross-project total verification.
  Actual: Safe nullification/preservation contract verified independently;
  multi-project supplier aggregation remains for a later populated fixture.
  Potential impact: No evidence of loss, but incomplete shared-total coverage.

### OBR-SCN-010 — Personnel and supplier associations reflect operational team changes

Result: **PASS WITH FINDING**

Observed behavior:

- `OBR-TST Miguel Benítez` was created as `electricista`, linked from Casa
  Rivas through the project’s Personal picker, then explicitly unlinked.
- The linked chip appeared with a dedicated unlink affordance. After unlink
  and fresh reload, Casa again showed `Nadie vinculado todavía`; no expense or
  financial total changed.

Persistence / derived-state verification:

- The UI state persisted across reload and project spend remained
  `₲ 6.270.000`; link/unlink did not create a financial record.

Findings:

- Finding ID: OBR-FND-006
  Classification: DOCUMENTATION
  Severity: S3
  Evidence: The canonical scenario names two personnel and Galpón Norte for
  reusable cross-project associations. The accumulated suite currently has no
  Galpón fixture.
  Expected: Two-project reuse and supplier pre-link verification.
  Actual: Link, unlink, reload, and no-financial-side-effect were verified for
  the present Casa fixture only.
  Potential impact: Cross-project uniqueness remains unexercised.

### OBR-SCN-011 — Finished project remains historical but leaves the active portfolio

Result: **PASS WITH FINDING**

Observed behavior:

- `OBR-TST Local Ñandutí` changed from `Activo` to `Terminado` through the
  explicit project action; the action then became `Reabrir`.
- Historial renders it under `Terminados · 1`, separate from archived Quincho,
  with a readable route, state, price, and zero financial rows.

Persistence / reload / retrieval verification:

- The state transition survived navigation to Historial. The finished card is
  accessible by a project link and has no archive state indicator.

Findings:

- Finding ID: OBR-FND-007
  Classification: DOCUMENTATION
  Severity: S3
  Evidence: The canonical Local Ñandutí initial state calls for a client,
  segments, suppliers, personnel, and spend. The state-transition test used a
  deliberately minimal Local fixture because those independent associations
  had not been established.
  Expected: Full historical-data preservation check.
  Actual: Finished-vs-archived state and history retrieval were verified; rich
  financial history under completion remains unexercised.
  Potential impact: No evidence of state loss, but partial fixture coverage.

### OBR-SCN-012 — Large expense and overrun communicate a recorded comparison

Result: **PASS WITH FINDING**

Observed behavior:

- A supplier-linked `₲ 1.400.000.000` Estructura expense was accepted for
  `OBR-TST Galpón Norte` against its `₲ 1.350.000.000` agreed price.
- Fresh load displayed grouped guaraníes without precision loss, `Excedido por
  ₲ 50.000.000`, and `104% del precio acordado`; the expense row retained its
  segment and Materiales attribution.

Persistence / derived-state verification:

- UI project spend and Estructura rollup both equal the one exact integer
  expense. The displayed negative comparison is `1350000000 − 1400000000 =
  -50000000` presented as the explicit overrun.

Findings:

- Finding ID: OBR-FND-008
  Classification: DOCUMENTATION
  Severity: S3
  Evidence: The canonical amount specifies one `238500000` entry plus enough
  additional spend to exceed the price. The test used one larger controlled
  integer to exercise the same overrun/formatting path.
  Expected: Exact named amount also searchable.
  Actual: Large integer and overrun behavior are proven; exact-amount search
  remains unexercised.
  Potential impact: Narrow retrieval coverage only.

### OBR-SCN-013 — Similar directory names and later operational retrieval

Result: **PASS WITH FINDING**

Observed behavior:

- Global search for `Materiales` returned a typed `PROVEEDORES` result and
  three typed `GASTOS` results. Each expense result includes supplier, project,
  full segment context, and a grouped amount, distinguishing Galpón’s
  `₲1.400.000.000` from Casa’s two Excavación entries.

Persistence / reload verification:

- This was a read-only search check; independent local count confirms retained
  records. Search state was rendered from the persisted project, supplier, and
  expense rows.

Findings:

- Finding ID: OBR-FND-009
  Classification: DOCUMENTATION
  Severity: S3
  Evidence: The similarly named `OBR-TST San Blas Materiales`, `cemento`
  descriptions, phone fragment, and exact formatted/unformatted amount fixture
  were not all established.
  Expected: Full ambiguity and every query-variant check.
  Actual: Supplier/expense type and contextual disambiguation were verified on
  existing Materiales results.
  Potential impact: Partial retrieval coverage.

### OBR-SCN-014 — High-density active portfolio and chip-picker pressure

Result: **BLOCKED**

Observed behavior:

- The final local count is 6 projects, 11 segments, 8 expenses, 2 suppliers,
  and 1 personnel—below the scenario’s explicit density precondition of seven
  projects, 20–30 segments, seven suppliers, six personnel, and 35–50 expenses.

Persistence verification:

- Read-only local count verification confirms the shortfall; no artificial
  bulk seed was introduced merely to claim scale evidence.

Findings:

- Finding ID: OBR-FND-010
  Classification: DOCUMENTATION
  Severity: S2
  Evidence: Required density precondition is absent.
  Expected: Usability/selection verification at defined realistic density.
  Actual: Cannot validly classify scale behavior from the smaller fixture.
  Potential impact: No conclusion about chip overload, narrow viewport behavior,
  or 35–50-expense retrieval.

### OBR-SCN-015 — Site observation and supplier issue with no expense

Result: **PASS WITH FINDING**

Observed behavior:

- Project and supplier surfaces provide financial records, directory links, and
  expenses. Universal Add exposes only Gasto, Cliente, Proveedor, Personal,
  Proyecto, and Segmento; no legitimate UI exists for a follow-up, assignee,
  due date, or supporting document.

Persistence verification:

- No expense, segment, revision, or other fabricated financial row was created.
  Local schema check confirms no `tasks`, `requests`, `notes`, or `attachments`
  table in this current-main scenario database.

Findings:

- Finding ID: OBR-FND-011
  Classification: PRODUCT GAP
  Severity: S2
  Evidence: The late delivery/crack requires a retrievable follow-up, owner,
  due date, and supporting evidence, none of which has a natural non-financial
  representation.
  Expected: Either a legitimate persistent operational record or a clear
  bounded absence.
  Actual: Retaining it would require external tooling or falsifying a financial
  record, which this run correctly avoided.
  Potential impact: Site issues can be lost or tracked outside Obras.

### OBR-SCN-016 — Receipt/photo and late information pressure

Result: **PASS WITH FINDING**

Observed behavior:

- Existing expense capture correctly retains project, segment, supplier, amount,
  and optional description. No present UI or current-main table legitimately
  associates a late receipt/photo or invoice document with that expense.

Persistence / derived-state verification:

- Existing financial rows and totals remain valid; no fake attachment metadata
  or unrelated note was invented. Local schema check confirms the absence of
  an attachment table.

Findings:

- Finding ID: OBR-FND-012
  Classification: PRODUCT GAP
  Severity: S2
  Evidence: A real invoice can be captured financially but its late supporting
  evidence cannot be attached or retrieved from the expense.
  Potential impact: Expense attribution works, but audit/document retention
  remains external.

### OBR-SCN-017 — Change request arrives before financial impact is agreed

Result: **PASS WITH FINDING**

Observed behavior:

- Depósito’s existing price revision is an explicit agreed-price record with
  old/new values and a reason; the revision UI rejects a same-value no-op.
  No UI records an unagreed loading-bay request or pending state without
  altering financial data.

Persistence / derived-state verification:

- No new price revision or expense was created for the hypothetical pending
  request. Local count remains one price revision and existing financial
  totals are unchanged.

Findings:

- Finding ID: OBR-FND-013
  Classification: PRODUCT GAP
  Severity: S2
  Evidence: Pending client work must be remembered before it becomes an agreed
  price revision, but the current model has no Request/Note state.
  Potential impact: Users may keep this critical pre-agreement context outside
  Obras or prematurely encode it as a financial change.

## End-of-suite local reconciliation (current accumulated fixture)

- Local `obras_scenario_test` contains 6 projects, 4 clients, 2 suppliers, 1
  personnel record, 11 segments, 8 expenses, and 1 price revision.
- Current visible project figures were independently reconciled where scenario
  data existed: Casa `₲ 6.270.000`; Depósito `₲ 190.000.000` with price
  `₲ 1.040.000.000`; Galpón `₲ 1.400.000.000` against `₲ 1.350.000.000`;
  archived Quincho retains `₲ 500.000`.
- The intended high-density and fully populated directory workspace was not
  reached; OBR-SCN-014 is therefore BLOCKED rather than inferred.

---

## OBR-TEST-004 — Scale fixture completion and OBR-SCN-014 retry

### Controlled fixture setup

The prior `OBR-SCN-014` BLOCKED result remains historical evidence: at that
time the scenario database held 6 projects, 11 segments, 8 expenses, 2
suppliers, and 1 personnel record. It did not meet the canonical density
precondition.

After confirming the isolated local target, controlled fixture setup added
only the missing realistic scale rows directly to `obras_scenario_test`:

- one active `OBR-TST Anteproyecto Rivas` project;
- five supplier and five personnel directory records;
- eleven segments distributed across Casa Rivas, Depósito San Blas, Reforma
  Benítez, and Galpón Norte; and
- twenty-seven dated, positive-integer, variably sized, supplier-linked and
  supplier-less expense rows distributed across active project segments.

Those repetitive rows are fixture setup, not claimed UI workflow evidence.
All original scenario-created records were retained. UI interaction was used
for the actual density/readability test below.

### OBR-SCN-014 — High-density active portfolio and chip-picker pressure (retry)

Result: **PASS**

Fixture verification before execution:

- 7 projects, 21 segments, 35 expenses, 7 suppliers, and 6 personnel records.
- State distribution: 5 active non-archived projects, 1 finished project, and
  1 archived project.
- Per-project distribution: Casa 6 segments / 17 expenses; Depósito 4 / 6;
  Galpón 5 / 6; Reforma 5 / 5; Quincho 1 / 1; plus the low-activity
  Anteproyecto and finished Local records.

Observed UI behavior:

- Proyectos renders the five active projects as independently navigable cards
  with client, state, spend, percentage, agreed price, segment count, and
  expense count. The zero-activity Anteproyecto remains distinguishable from
  materially active work; Galpón’s `104%`/`excedido` state remains explicit.
- Panel renders 5 active projects and recent activity without including the
  finished or archived projects in its active aggregate.
- Global Quick Capture exposed 6 non-archived projects, 7 suppliers, and the
  selected project’s segment list. Switching from Casa Rivas to Galpón Norte
  removed the Casa/Excavación choices and selected valid Galpón `Seguridad`;
  no stale cross-project segment remained selected.

Persistence verification:

- UI inspection was read-only. Local-only reconciliation found the fixture
  counts above and no unexpected project-state changes.

Derived-state verification:

- Independent active-portfolio calculation is 5 projects, agreed total
  `3125000000`, and recorded spend `1638585000`. Panel displayed the same
  `₲ 1.638.585.000` spend and `₲ 1.486.415.000` recorded margin.
- Galpón’s important segment own-spend rows reconcile as Estructura
  `1401700000`, Seguridad `2800000`, Columnas `2350000`, Cubierta `960000`,
  and Preparación `820000`; their sum matches Galpón’s project spend.

Reload/retrieval verification:

- Project-list and Panel were freshly loaded after fixture setup. Project and
  expense links preserved identifying project/segment context; Quick Capture
  project switching maintained a valid current segment.

Findings: none. The retry resolves the initial fixture-only BLOCKED result;
it does not erase that earlier checkpoint.

## OBR-TEST-004 reconciliation

- Final fixture totals: 7 projects, 21 segments, 35 expenses, 7 suppliers,
  6 personnel records, 4 clients, and 1 price revision.
- Total recorded spend across all projects: `1639085000`; the `500000`
  difference from the active Panel total belongs to archived Quincho.
- Finished Local has zero spend and is excluded from active Panel totals;
  archived Quincho retains its rows and is also excluded.

### OBR-SCN-005 — Preserve financial history by archiving rather than deleting

Result: **PASS**

Observed behavior:

- `OBR-TST Quincho Gómez` received a `Pintura` segment and retained
  `₲ 500.000` recorded spend. Once it had financial history, the detail UI
  replaced the deletion affordance with an explicit message that it cannot be
  eliminated because doing so would lose financial history.
- **Archivar proyecto** changed the visible state to `Archivado` and stated
  that records remain intact. `Historial` then listed it under `Archivados · 1`
  with its client, spend, price comparison, segment count, and expense count.

Expected behavior:

- A financially used project cannot be hard-deleted; archive preserves its
  readable records while removing it from active work.

Persistence verification:

- Local-only query confirms `archived_at` is populated and exactly one
  expense, one segment, and `500000` recorded spend remain.

Derived-state verification:

- History renders the same `₲ 500.000` against `₲ 115.000.000` and margin
  `₲ 114.500.000`, consistent with the preserved local rows.

Reload verification:

- History navigation after archive rendered the archived card rather than an
  active-project entry.

Guard result:

- The UI provides a direct, contextual deletion guard before archive; no
  deletion action or data loss occurred.

History/retrieval verification:

- `Historial` locates Quincho via an archived-project link with recognizable
  financial context.

Findings: none.

### OBR-SCN-004 — Price revision changes the comparison, not recorded spend

Result: **PASS**

Observed behavior:

- A controlled `₲ 190.000.000` expense was recorded for newly created
  `OBR-TST Depósito San Blas` at its initial `₲ 920.000.000` price.
- **Revisar precio** changed the agreed value to `₲ 1.040.000.000` with reason
  `Ampliación acordada`. Re-submitting the same value showed: `El nuevo precio
  es igual al vigente: no hay nada que revisar.`

Expected behavior:

- One price-revision history row changes only the price comparison, while a
  no-op is rejected and recorded expenses remain unchanged.

Persistence verification:

- Local-only query reports current price `1040000000`, spend `190000000`, and
  exactly one revision: `920000000 → 1040000000`, reason `Ampliación acordada`.

Derived-state verification:

- Reloaded UI matches the independent values: spend `₲ 190.000.000`, agreed
  `₲ 1.040.000.000`, difference `₲ 850.000.000`, and 18% recorded spend.

Reload verification:

- Fresh detail load retained the revised price, original expense, and
  `Ver 1 revisión` affordance.

History/retrieval verification:

- The project detail retains both visible financial comparison and the durable
  revision-count entry point.

Findings: none.

### OBR-SCN-003 — Capture from project context and correct an entry

Result: **PASS**

Observed behavior:

- `Instalaciones > Eléctrica` and `OBR-TST ElectroSur` were created, then the
  project-detail **+ Registrar gasto** flow recorded `₲ 3.400.000` on
  Eléctrica. The project context did not offer a project picker.
- Its edit dialog showed the fixed `OBR-TST Casa Rivas` identity plus
  segment, amount, supplier, date, and note controls—no cross-project
  reassignment control. Editing replaced the amount with `₲ 3.650.000` and
  the description with `Corrección: instalación eléctrica`.

Expected behavior:

- A project-context expense remains attached to its project; edit updates the
  one row and replaces, rather than adds, its financial contribution.

Persistence verification:

- Local-only query found one corrected row with amount `3650000`, the updated
  description, Casa Rivas as project, Eléctrica as segment, and ElectroSur as
  supplier. Its project aggregate is `6170000`, confirming no duplicate.

Derived-state verification:

- Reloaded UI shows Casa Rivas spend `₲ 6.170.000`, difference
  `₲ 478.830.000`, and Eléctrica/Instalaciones rollups of `₲ 3.650.000`;
  these match the independent aggregate and the earlier `₲ 2.520.000` tree.

Reload verification:

- Fresh load retained the corrected description, supplier, amount, segment
  path, four-row activity list, and amended project/segment totals.

History/retrieval verification:

- The project activity table exposes the corrected row in its full segment
  context with supplier and edit access.

Findings: none.

### OBR-SCN-002 — Repeated global Quick Capture on one segment

Result: **PASS**

Observed behavior:

- From the non-project `Proyectos` route, global **+ Agregar** opened with
  `Gasto` selected. `OBR-TST Casa Rivas` and `Excavación` were selectable
  chips, with the latter shown in its full `Obra gruesa / Cimientos` path.
- While the popup remained open, three saves registered `₲ 850.000` with
  `OBR-TST Materiales Ybycuí`, `₲ 420.000` without a supplier, and
  `₲ 1.250.000` with that supplier. The in-popup session log reported three
  expenses and `₲ 2.520.000`.

Expected behavior:

- Three positive, same-project/same-segment expenses persist; supplier is
  optional; project and ancestor rollups equal `₲ 2.520.000`.

Persistence verification:

- Local-only aggregate query found exactly three Casa Rivas/Excavación rows,
  total `2520000`; two retain `supplier_id` and one has a null supplier.

Derived-state verification:

- Independent segment aggregates for `Excavación`, `Cimientos`, and `Obra
  gruesa` each equal `2520000`. The reloaded UI shows that same value on all
  three levels and on project recorded spend, with a price difference of
  `₲ 482.480.000`.

Reload verification:

- Fresh project-detail load retained all three activity rows, their supplier
  attribution (including one `—`), full segment paths, and all rollups.

History/retrieval verification:

- Project detail’s recent-activity table exposes each resulting entry with
  date, segment path, supplier, amount, and edit control.

Findings: none.
