# OBR-UX-001 — Obras UX/UI Refinement Specification

**Classification: CURRENT UX WORKING DRAFT.** Status: **READY FOR UX/UI
REVIEW** — recommended design contract, pending review; not authorization to
implement every proposed capability. It governs no domain or persistence
semantics: `../TECHNICAL_SPEC.md` and executable schema/code remain
authoritative. Once a bounded UX slice is approved, reconcile the applicable
decisions with implementation and retain this checkpoint as design history.

Date: 2026-09-11. Application: `/Users/test/Dev/aiprojects-builds/obras`. Inspected parent-repository HEAD: `2d3a2b51d637c6a2b1c304aa1ba9c4470d24b2d4`.

This checkpoint creates documentation only. No application, style, schema, migration, database, auth, dependency, environment, or deployment changes are part of OBR-UX-001. Recommendations below describe subsequent engineering work.

## A. Design objective

Make Obras a compact construction operations workspace in which an engineer can identify a project, understand its recorded financial position, locate its cost structure, and enter another expense quickly. Add a clearly separate temporal dimension only after explicit project-date support exists. Money, elapsed time, and physical completion are three independent concepts; neither money nor dates imply physical completion.

**RECOMMENDED:** charcoal navigation, warm neutral work surfaces, restrained orange actions, rectangular project selections, structured segment trees, and aligned financial rows. The distinctive operational composition is a project identity header followed by separate money and time bands above the recursive cost structure. No hero, decorative gauges, task boards, or generic ERP expansion.

### Scope classification

| Class | Meaning | Work in this contract |
| --- | --- | --- |
| A — Immediate UX/UI | Uses current persisted meanings; may require presentation queries or route/UI work | Tokens, shell/session area, state labels, cards, segment hierarchy, capture geometry, drawers, directory sorting, money-only Panel, OBR-FND-004 wording |
| B — Minimal product/schema prerequisites | Explicit changes to capture/domain contract; not concealed in styling | Active-only new-expense eligibility, optional project type/location, project dates, date validation and completion/reopening semantics |
| C — Future product evolution | Separate capability requiring later authorization | Phases, reusable structures, templates/durations, follow-ups, attachments, pending client changes, richer scheduling |

Class B eligibility requires domain/server-action work but no new column. Project metadata and dates require schema work. Project temporal rendering depends on B; phase rendering depends on C. Class A does not show dummy dates, fake phase names, or disabled future navigation.

## B. Current UI diagnosis

### Evidence and limits

Primary sources read first: `TECHNICAL_SPEC.md`, `docs/SCENARIO_TESTS.md`,
`docs/SCENARIO_TEST_RESULTS.md`, then `README.md`. README is operational
support, not design authority. Current auth is a shared password/session gate
with no user identities.

Implementation inspected: `app/layout.tsx`, `app/globals.css`; Proyectos, project detail, Historial, Panel and directory routes; `AppShell`, `ProjectCard`, `SpendSummary`, `StatusToggle`, `ProjectDangerZone`, `SegmentManager`, `UniversalAdd`, `ExpenseQuickForm`, `QuickAddExpense`, `ChipPicker`, `DirectoryTable`, `DirectoryFormPopup`, `ProjectQuickForm`, and `Popup`; relevant portions of `lib/panel-actions.ts`, `lib/expense-actions.ts`, `lib/money.ts`, and `prisma/schema.prisma`. `package.json` and Obras `AGENTS.md` were inspected for stack and working constraints. Parent `TECHNICAL_SPEC.md` and unrelated applications were not used.

Evidence labels below:

- **S1:** user-supplied current Obras screenshot, Image 1: global Quick Capture over populated Panel. This is the only attached current-product screenshot. Its left-side conversation text is contextual material, not an additional command.
- **CODE:** directly inspected current source; supports structure and implemented behavior, not claims about a fresh rendered screen.
- **SCENARIO:** supplied durable scenario evidence, especially OBR-TEST-004. Latest results supersede earlier fixture-only blocked checkpoints. User handoff reports 17 resolved: 6 PASS, 11 PASS WITH FINDING, 0 FAIL, 0 BLOCKED. Some individual scenarios retain explicitly narrower coverage findings; “resolved” does not erase those limits.
- **R2–R5:** external inspiration images; not Obras capabilities or data.

The recorded dense fixture has 7 projects, 21 segments, 35 expenses, 7 suppliers, 6 personnel, 4 clients; 5 active, 1 finalized, 1 archived. Scale retry confirms cards, Panel, capture, hierarchy selection, retrieval, and project-switch selection reset remained usable. This is a hierarchy refinement, not a claimed scale failure.

**Live inspection limit:** no new browser flow/screenshots or database queries were performed. A listener exists on port 3000, but its database override could not be verified. The repository `.env` points to legacy local `obras`; no explicit runtime database URL was exposed by the process check. The server was neither restarted nor reconfigured, and no login/session operation was performed. Current visual conclusions use S1; other screen conclusions use CODE and SCENARIO. This does not block a design review, but is not fresh runtime or accessibility certification.

### Findings by surface

| Surface | Preserve | Refine and evidence |
| --- | --- | --- |
| Shell | Six stable destinations, global search, prominent global add, collapse preference, construction-related Lucide icons | Green identity and soft add emphasis do not express the requested direction (S1/CODE). `Salir` already exists at the bottom; the issue is visibility/labeling, not missing auth functionality. No fabricated profile (CODE). |
| Project cards | Name/client/spend/price/margin/counts; independent project links; overrun text | Status is already top-right in `ProjectCard`; strengthen its size and separation rather than describing a nonexistent relocation. `Activo` and archived status can coexist as two pills, obscuring retention precedence. Fixed 320px grid wastes intermediate widths. Margin/percentage compete with spend (CODE). |
| Project detail | Money → recursive segments → activity → relationships is sound; price revisions have their own workflow | Add compact identity context; align financial labels; distinguish lifecycle, archive, and delete actions. Dates/type/location are absent, so temporal composition is gated (CODE). |
| Segments | Expanded recursive tree, hierarchy rails, rollup, own spend, visible add/edit actions | Small 15px caret and 22px icon controls are touch risks; own spend is tiny and conditional. Deep indentation competes with long names and numbers. Do not flatten the cost model (CODE). |
| Quick Capture | Gasto default; one surface; optional supplier visible; memory and repeated saves; valid project-switch reset | Six categories, projects, segments, and suppliers reuse similar rounded control language; small submit has inadequate priority. S1 shows an eligible finished project under the existing rule. Major vertical stages need containment and a stable footer (S1/CODE/SCENARIO). |
| Directories | Name search; linked project navigation; telephone links; shared forms | Name-only navigation lacks row affordance; column headings have no sorting controls. Full-screen record navigation interrupts scanning. Past-project link styling combines finished/archived. Personal already has nullable `rol` in code/schema despite omission in the technical spec (CODE). |
| Supplier detail | Recorded total, expense list and project links | Per-project spend exists in domain retrieval but current rendered detail reduces project context to tags. Replace tags with readable per-project amount rows; distinguish explicit links from expense-derived association where evidence is available (CODE/spec). |
| Historial | Already has separate finished and archived sections | Rename `Terminados`; strengthen section separation and state semantics. Do not invent a completion date from `updatedAt` (CODE). |
| Panel | Active-only aggregate, exact amounts, project navigation, recent expenses | Three equal KPI cards hide agreed total in a caption and do not surface individual overruns early. Project comparison needs named denominators. No temporal data exists (S1/CODE/SCENARIO). |
| Dialogs | Shared `Popup`, visible close, Escape support, shared form bodies | Source sets `aria-modal` but does not implement focus containment/restoration or background inertness. Backdrop/Escape discards a draft. Add these behaviors in the shared primitive, not screen-by-screen (CODE; runtime not tested). |

## C. Reference interpretation

| Image | Useful principle | Application in Obras | Do not copy |
| --- | --- | --- | --- |
| 1 — current capture over Panel | Real density: long project/vendor names, full guaraníes, simultaneous choices, large background totals | Keep explicit project/segment context and visible supplier stage; improve grouping and submit hierarchy | Conversation-pane text as product requirements; six equivalent white chips; tiny submit |
| 2 — black/orange/dirty-white palette | Strong identity from a small palette: `#1A1A1A`, `#FE531D`, `#EAE7E2`, `#2E2E2E` | Charcoal shell; warm background; orange primary actions and selected edges | Large orange page areas; white small text on bright orange without contrast checks; print CMYK values |
| 3 — attendance/jobs/employees cards | One question per group; large primary number; directly labeled subdivisions | Financial band and concise active-state count; aligned related quantities | Attendance, jobs, staffing metrics, semicircle gauge, unsupported month-over-month arrows; pastel category proliferation |
| 4 — construction project detail | Identity first; dense operational context; money band; time occupies a meaningful horizontal surface | Project-detail order and future month/week timeline with phase ranges | Task cards, assignees, labor hours, invoice/paid/due data, project identifiers, dependencies or scheduling semantics not in Obras |
| 5 — dashboard | Clear numerical hierarchy; segmented composition with adjacent labels; compact list/table controls | Panel comparison rows, clear filters/scope, exception-to-project navigation | Trend arrows and mini-bars without a real time series; decorative gradients; huge rounded corners; customer segmentation metrics |

Reference interpretation is captured here in words so the next agent does not depend on temporary clipboard image paths. No generated mockup is claimed or required by this specification checkpoint.

## D. Design system

### Color roles

Use named roles in `app/globals.css`; extend the existing central tokens rather than introducing a theme library. Semantic roles must not be aliases of the orange brand role.

| Role / proposed token | Value | Use |
| --- | --- | --- |
| `--bg` | `#EAE7E2` | Warm outer workspace |
| `--surface` | `#FFFFFF` | Main content groups, inputs, drawers |
| `--surface-alt` | `#F5F3EF` | Table headers, quiet capture pads |
| `--text` | `#1A1A1A` | Primary copy and numbers |
| `--text-muted` | `#625D57` | Secondary copy; not opacity-reduced labels |
| `--border` | `#D8D2CA` | Nonessential dividers |
| `--border-strong` | `#827A70` | Input/control boundary when needed for recognition |
| `--accent` | `#FE531D` | Primary button fill; selected edge; identity accent |
| `--accent-fg` | `#1A1A1A` | Text/icons on bright orange |
| `--accent-soft` | `#FFF0E8` | Selected entity surface |
| `--accent-ink` | `#A9360D` | Orange-family text/link/focus on light surfaces |
| `--sidebar-bg` | `#1A1A1A` | Navigation |
| `--sidebar-active-bg` | `#2E2E2E` | Selected/hovered navigation surface |
| `--sidebar-text` | `#C9C3BA` | Idle navigation |
| `--sidebar-text-strong` | `#F5F3EF` | Active navigation/brand |
| `--success` / soft | `#246447` / `#EAF2EC` | Activo indicator, saved feedback; no implication of profit |
| `--completed` / soft | `#39546A` / `#EDF1F5` | Finalizado check icon and text |
| `--archive` / soft | `#625D57` / `#EEEAE4` | Archivado icon, subdued surface |
| `--warning` / soft | `#83500C` / `#FFF3D8` | Approaching expected end, once dates exist |
| `--danger` / soft | `#A8322D` / `#F8ECEC` | Overrun, overdue, delete, error |

Orange means action/selection, not “late.” Financial bars are charcoal under the price and red when exceeded. Time uses thin neutral rules and markers. Physical progress has no meter. Do not color positive recorded margin green as a declaration of business health; it is a remaining arithmetic difference, not realized profit.

Contrast targets: body copy 4.5:1, large text 3:1, essential boundaries/icons/focus 3:1. Bright orange gets near-black text, not white small text. Soft fills require a darker label and selected check/edge. Calculated static contrast examples: black on orange 5.36:1; muted text on warm background 5.28:1; dark-orange text on selected fill 5.86:1; completed text on completed fill 6.98:1; strong input border on white 4.23:1. These are token-pair checks, not rendered accessibility certification. Validate all pairs after implementation, including focus against both surfaces; do not apply reduced opacity to an entire archived card or missing-data label.

### Typography and numbers

**RECOMMENDED:** retain the existing native system sans stack: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`. Current `layout.tsx` imports no font and `globals.css` already provides this stack; it requires no dependency, network fetch, license acquisition, or build-time download. The refinement comes from hierarchy and numeric setting, not a new display font. This is practical for the installed Next/React/CSS stack. Cross-platform metrics may vary; test Safari/tablet and Chrome before acceptance.

| Role | Desktop | Tablet/narrow | Weight |
| --- | --- | --- | --- |
| Page title | 28/34px | 24/30px | 650 or 600 fallback |
| Project card name | 17/22px | same | 650/600 |
| Section title | 16/22px | same | 600 |
| Primary amount | 28/34px | 24/30px | 650/600 |
| Capture amount | 32/40px | 28/36px | 600 |
| Body / controls | 14/20px | 15/22px | 400/500 |
| Table body | 13/19px | 14/20px | 400; name 600 |
| Label / helper | 12/17px | 13/18px | 500/400 |

Use tabular lining numerals for financial values, dates, percentages, and counts; right-align numerical table columns. Never shrink long amounts below the body size to fit. Break layout into rows instead. Keep `₲` attached to its amount, at least 12px and legible; preserve dot grouping and integer values. Full amounts remain visible in primary financial surfaces. Use the existing `formatGs`, `formatSpendPct`, `spendBarWidth` definitions, including zero denominator, `<1%`, true overrun percentage and visually clamped bar.

### Spacing, surfaces, and geometry

Spacing scale: 4, 8, 12, 16, 24, 32px. Page gutter 24 desktop, 20 tablet, 16 narrow. Section gap 24; related rows 8–12. Card padding 16; primary detail band 20–24. Widths must flex to available content, not hard-code all cards to 320px.

Radii: 4px for small badges/selection tiles; 6px for controls; 8px for major groups/drawers. A pill radius is reserved for lightweight relationship chips. Border 1px. No resting card shadows; a single restrained elevation is allowed on overlaid dialogs/drawers. A surface groups a coherent question, not each field. Use a horizontal divider within shared money/time or contact groups instead of nested cards.

| Shape | Meaning / treatment |
| --- | --- |
| Underline tab with icon | Object/mode switch; not a selectable record |
| Rectangular mini-card | One important project choice; name + client, selected check + orange edge |
| Indented structured row | Segment in recursive cost hierarchy |
| Compact rounded chip | Optional supplier/relationship; one label and optional remove control |
| Small dot | Active state or selected sidebar location, always accompanied by readable context |
| Check / archive icon + compact badge | Completed lifecycle / archived retention; noninteractive |
| Full-width solid button | Expense commit; other primary saves use solid buttons in a stable footer |
| Bordered content group | Financial summary, cost structure, activity, directory detail |

Do not assign six colors to the six object kinds. Reuse existing Lucide 18px, 1.5–1.75 stroke icons: expense receipt, client handshake, supplier truck, personnel users, project hard hat, segment hierarchy. Same icon means same object everywhere. Touch hit area is independent of icon size.

### Interaction primitives

- Primary: orange fill + black text. Secondary: neutral outline. Tertiary: text/icon with explicit label when needed. State transition: completed-tone outline + check, not red. Archive: charcoal outline + archive icon in a distinct retention row. Delete: red outline trigger, red solid only in confirmation. Logout: explicit subdued red/light-red text at sidebar bottom, no routine confirmation.
- All actionable controls have a 44px touch area; dense rows may visually use smaller icons within that area. Keyboard focus is a 2px dark-orange outline with 2px offset on light surfaces, bright-orange/white separation on charcoal.
- Extend `Popup` as shared modal base. Focus enters heading/first meaningful field, stays inside, restores to trigger on close; background is inert. Close and Escape work; a dirty draft requests `Descartar cambios` / `Seguir editando`. No prompt for simply choosing a remembered project/segment without entering data. Pending submit disables repeat commit, preserves width, reports `Guardando…` and errors without clearing fields. Ambiguous network failure must not silently auto-retry a financial mutation.
- Shared drawer variant uses the same focus/close/error contract. Default modal right drawer 480px; supplier detail up to 560px. Under 768px use full-width detail surface. Internal body scroll; heading/close and form footer remain reachable with virtual keyboard. Lock background scrolling without page-width jump.
- Keep native selects and native date inputs for the initial metadata forms; browser-owned popup geometry/locale is explicitly accepted. Spanish labels/help remain app-owned. Do not introduce a custom calendar or select library solely for appearance.
- Tables use true headers, explicit links/buttons, `aria-sort` on sortable columns, row focus/selection state, and readable no-results states. A row's background may open detail, but nested phone/project links must retain their own behavior; do not wrap nested interactive controls in a link.
- Motion only for drawer/collapse, 120–160ms; honor reduced motion. No animated financial counting.

Canonical ownership remains in existing components: `AppShell` navigation/session, `Popup` overlays, shared form bodies for create/edit/capture, `ProjectCard` cards across list/history, `Gs` and money helpers formatting, `SegmentManager` hierarchy, `DirectoryTable` directory list. Add a shared drawer or badge variant only when its slice needs it. This document is the checkpoint's durable design context; do not create a competing `DESIGN.md` or UI implementation during OBR-UX-001.

## E. Application shell

### Hand-test integration — OBR-UX-002 closeout

**Obra is the central operational object.** When a valid domain relationship exists, surrounding business objects must be cheap to create, connect, detach, and retrieve in Obra context. This does not authorize arbitrary relationships or change the existing domain model.

**Quick Capture evolution:** `+ Agregar` will evolve from record creation toward the low-friction create-and-connect interface for the operational graph: Gasto → Obra/Segmento/proveedor opcional; Proveedor or Personal → Obra when that relationship is valid; Segmento → Obra/segmento padre; and, later, Fase → Obra. This is a future Quick Capture refinement, not behavior implemented by this shell checkpoint.

**Responsive navigation:** expanded sidebar (about 224px) → persistent collapsed icon rail (72px) → overlay/hamburger only below 768px. Icon-only rail destinations retain accessible names, tooltip titles, current-route semantics, and the orange current-location indicator. Exactly one global `+ Agregar` is reachable per shell state: expanded sidebar or rail above 768px; top bar below 768px.

**Deferred hand-test inputs:** H02 low-friction Obra relationships belongs to Project Detail/Quick Capture/Directory slices; H03 hierarchy clarity, H04 root-segment wording, and H05 segment differentiation belong to Segment refinement; H06 search prominence, H07 sort, H08 valid-domain filtering, and H09 directory identity belong to the Directory slice. H10 confirms the charcoal/orange/warm-neutral foundation; future work must improve screen composition, hierarchy, density, relationships, differentiation, and retrieval controls without reopening this palette absent new evidence.

**RECOMMENDED:** keep destination names and order: Proyectos, Historial, Panel; divider/group heading; Clientes, Proveedores, Personal. Preserve global search's typed results and expense context.

Desktop sidebar 224px, charcoal, viewport-height with independently scrollable navigation; brand at top, 44px full-width `+ Agregar` directly below. Bottom session area must remain visible, not pushed below a long page. Active destination has lighter charcoal rectangle, strong text/icon, and one right-side orange dot. The dot means current location only (`aria-current="page"` supplies semantics); no random notifications/counts. A project detail entered from Historial can retain its contextual back link even though its route belongs to Proyectos.

Top bar: 56px minimum, menu toggle, search. The collapsed rail retains a compact Add control; below 768px, expose `+ Agregar` in the top bar so capture never costs an extra menu step. Keep the existing collapse preference; on narrow viewports navigation becomes an overlay and closes after destination selection. Do not erase desktop preference when temporarily opening mobile navigation.

No profile avatar, email, user name, role, or account-settings destination without an identity model. Session area specification is in R.

## F. Project list

Retain `/proyectos` as the active operational workspace. Header: `Proyectos`, secondary `5 activos` from the current query, `+ Nuevo proyecto`. Below the grid, a quiet `Ver finalizados y archivados` link goes to Historial. No duplicated history cards in the active query.

Card grid uses available content width: minimum preferred card width 300px, equal flexible columns; 3 columns only when content fits ≥948px including gaps, 2 at ≥616px, otherwise 1. Long names wrap rather than compress amounts. Single primary card link; no invisible gesture or nested action menu required.

Card order and emphasis:

1. Name (17px, maximum two visible lines with full name available on detail); top-right readable state badge 12–13px, icon, 24px visual height. Status must not overlap name.
2. After metadata slice: `Vivienda · Asunción` as secondary identity; client on its own line. With current data, show client only; do not fabricate type/location from name.
3. `Gasto registrado` label; primary spend amount. Agreed amount is a separate supporting line `Precio acordado ₲ …`.
4. 6px charcoal financial bar and explicit `X% del precio acordado`. Under it `Margen registrado ₲ …`; overrun instead gets `Excedido por ₲ …`, red text/icon and full percentage. This bar never says completion.
5. After date slice: thin time rule with calendar icon, compact month/year start → expected end and explicit `N días transcurridos`, `Inicio en N días`, or `N días fuera de plazo`. This is separated by spacing and a label `Tiempo`, not a second thick filled progress bar.
6. Footer divider, segment count and expense count. Future phase summary can occupy one labeled line `Fase: Estructura`; absent capability means no row.

Zero expense is `₲ 0`, never a dash. Missing client is `Sin cliente asignado`. A missing type need not consume a card row; missing dates after capability release get `Fechas sin registrar`, no empty meter. Finalized and archived variants are defined in O/Q and reuse the same amount hierarchy.

## G. Project detail

**RECOMMENDED composition:** one vertical operational page; avoid seven independent dashboard tiles.

1. Contextual back link (`Proyectos` or `Historial`), project name and right-aligned status. Identity subline contains type and location once supported; client remains a separate link. Address exposes copy/open actions on detail. A small state banner explains archival retention where applicable.
2. Action row: primary `Registrar gasto` for eligible projects; secondary `Editar proyecto`; explicit lifecycle action `Marcar como finalizado` or `Reabrir proyecto`. Archive has a distinct retention section below, with a contextual jump from an `Acciones` menu if needed. Never show both finalize and reopen for the same lifecycle state.
3. Money band, full width: spend first, agreed price second, recorded margin third. One labeled price-consumption bar below all three. `Revisar precio` and `Ver N revisiones` attach to the agreed-price area. Price stays read-only in general edit; initial price and audited revisions remain distinct.
4. Time band, after B: dates summary + month/week overview. Future phase rows extend this time section; they are not nested under Segmentos.
5. `Segmentos y gastos`: cost tree with visible own/total headers and root-add action. On large screens keep tree full-width to protect names/amounts, rather than squeezing it beside a sidebar of cards.
6. `Actividad reciente`: eight expense rows, then `Ver todos los gastos (N)`; newest by existing `spentAt`, then `createdAt`. Clicking a row opens existing expense editing with fixed project. Keep full segment path, supplier/absence, and description readable; preserve full-list retrieval.
7. `Proveedores y personal`: two labeled groups in one surface; existing link/unlink controls and record navigation. Unlinking is not deleting a supplier or expense.
8. `Archivo y conservación`: explanatory archive/unarchive row. Separate divider before legitimate deletion/guard text. Retain financial history and current deletion guards.

Class A keeps steps 1–3 and 5–8 with current fields. Class B supplies the identity/time fields; C supplies phases. These gates prevent a future engineering agent from shipping empty planning widgets during a visual slice.

## H. Time / timeline

### Minimal dates and semantics — Class B

Recommend optional date-only project fields `startDate`, `expectedEndDate`, `actualEndDate` (nullable database DATE representation; ISO `YYYY-MM-DD` at UI boundary). Do not repurpose `createdAt`, `updatedAt`, expense dates, or archive time. Existing rows remain null; no inferred backfill.

`Fecha de inicio` is the single declared project-start anchor, which may be in the future. It is not a separately audited actual-start event. This initial model deliberately has no planned-vs-actual start pair. Labels before start say `Inicio previsto`; after start say `Desde el …` without claiming verified site activity.

Recommended validation:

- Expected end must be on/after start when both exist; actual end on/after start when both exist.
- Actual end cannot be in the future and belongs only to a finalized lifecycle. Finalizing offers today's date, visibly editable; user can leave unknown as `Sin registrar`. Existing finalized projects stay unknown until explicitly entered.
- Both status-entry paths (edit and lifecycle action) must apply the same completion-date rules. Prefer moving lifecycle out of generic edit into its explicit action to remove duplicate behavior.
- Reopening explicitly clears actual end with explanatory text before commit; no implicit completion-history claim. The current model has no lifecycle event history. Archive/unarchive never changes lifecycle or completion dates.
- Changing expected end is a current plan edit, not a baseline comparison. Original-plan variance is unsupported.

Date arithmetic uses calendar days, not raw 24-hour milliseconds; use one project/portfolio definition of today in `America/Asuncion`. This is a proposed temporal contract, not a change to existing expense-date semantics. Native inputs submit date-only strings and render without UTC date shifting. Test month ends, leap day, and users opening the UI in another timezone.

Derived values, when inputs exist:

- For active projects, reference day = today. For finalized projects, reference day = actual end; if unknown, do not continue accruing elapsed/delay values as if still active.
- Elapsed = calendar-day difference from start to reference day, minimum zero. Future start: `Inicio en N días`.
- Remaining planned = expected end minus today for active projects before/on end. On end: `Finalización prevista hoy`; strictly after end: `N días fuera del plazo previsto`.
- Finished variance = actual end minus expected end; positive `Finalizada N días después de lo previsto`, negative `Finalizada N días antes`, zero `Finalizada en la fecha prevista`.
- No elapsed percentage needs to be shown in V1. If later added, it must say `Tiempo previsto transcurrido` and never physical completion.

### Project-detail rendering

Month view default. Header includes `Tiempo`, `Meses | Semanas`, `Hoy`, and labeled previous/next range controls. Initial month range includes known start/end and today; for long projects use a readable six-month window centered near today with visible text dates and `Ver período completo`. Week view shows an eight-week window, ISO Monday starts, each week labeled by day/month; no daily cells/tasks. Selected scale/window is view state only.

One horizontal ruler: filled start circle, hollow expected-end marker, check-shaped actual-end marker, vertical orange today line with `Hoy`. Markers have labels and exact dates in adjacent text, available without hover. Expected interval is a neutral thin bar; overdue extension after expected end is red/dashed plus text. Same-day start/end uses a marker, not a zero-width invisible range. Today outside the shown window gets a directional indicator; `Hoy` recenters.

Unknown start or end: show known dates and `Inicio sin registrar` / `Fin previsto sin registrar`; no invented range or percentage. Finalized with unknown actual end: expected interval may remain, but text says `Fecha real sin registrar`, no false actual marker. Archived timelines retain known history and an archive banner; they generate no active attention alerts.

Tablet: keep date summary and current condition outside the scrolling region; ruler may scroll locally with fixed name column. Narrow screens default to summary plus `Ver línea de tiempo`; the date facts never require horizontal scrolling. No drag scheduling, dependencies, resource allocation, forecast, or critical path.

## I. Fases

**RECOMMENDED future model:** Phase is a separate, project-owned operational/time object. Segment remains the arbitrary recursive cost-attribution tree. A cost branch such as Seguridad can span multiple execution phases; one phase can incur expenses in multiple branches. Adding optional schedule fields only to root segments would incorrectly tie accounting hierarchy edits to execution sequence.

**APPROVED PRODUCT DECISION:** Fase is a separate future project-owned temporal/operational capability; Segmento remains the recursive cost-attribution structure. Its manual lifecycle/date semantics still require a separately authorized later implementation slice. No decision on physical-percent modeling is needed now because that capability is excluded.

Proposed later minimal fields: project, name, display order, nullable planned start/end and actual start/end, manual `Próxima | En curso | Finalizada`. Permit simultaneous phases; do not force exactly one current phase. Phase state is not inferred from calendar or spend. No Phase–Segment FK/link table in the first capability; no automatic conversion of roots into phases. Any later mapping needs a real use case and separate decision.

Desired UI: within the time section, phase names in a fixed 160px left column, one 40–44px row each, horizontal planned date range on the shared project ruler. `Próxima`: outlined range; `En curso`: pale orange range + dark-orange leading edge and label; `Finalizada`: completed-tone fill/check. Actual dates, where entered, use a second fine line/endpoint rather than overwriting planned range. Delayed uncompleted phase gets red endpoint + `Fuera de plazo`; completed late retains finalized state and late text. Missing dates create an unscheduled row, not an invented bar. Overlapping date ranges are supported.

Header summary `En curso: Estructura` or `2 fases en curso`; separate `Próxima: Instalaciones` from an explicit ordered manual state. Do not label the most recently used segment a phase. Touching a range opens an accessible phase detail surface in that later slice. Tablet preserves name/state outside local timeline scroll. No task board, dependency arrows, percent-complete meters, generated schedule, or drag handles.

## J. Segments

Use `SegmentManager` and existing recursive data/guards. Section header: `Segmentos` plus explanation `Gastos propios y acumulados`; right action `+ Segmento raíz`.

Desktop row grid: disclosure / name and hierarchy / `Propio` / `Con subsegmentos` / actions. Root has 600 weight and a subtle top divider; child 500; leaf 400–500. Indent 16px per level with a 1px connecting rail. Node name and total remain visible; totals align across depths. Leaf total equals own spend; do not display two unlabeled identical figures. For leaf rows show own spend in `Propio` and `—` in `Con subsegmentos`, with accessible text `Sin subsegmentos`; the underlying total remains equal to own spend. Parent rows show both amounts, including zero.

Keep full tree expanded by default as today; add `Contraer todo` / `Expandir todo` only as view controls if density warrants. Preserve expansion during same-page operations. Selecting/opening a row gives pale orange background and selected marker; plain rows are not colored like status badges. `Añadir subsegmento` and `Editar segmento` remain discoverable with 44px hit areas, accessible names containing node name. Existing native reparent selector excludes descendants/cross-project nodes; show full parent path to disambiguate duplicate names.

At narrow width, each row has name/actions first, two labeled amount values beneath; after four visible indentation levels cap geometric indentation and expose full breadcrumb/path on the selected row. Depth information remains explicit. Do not truncate amounts, hide own spend exclusively in a tooltip, limit recursion in storage, or change project totals.

Optional root-level composition uses only root `totalSpend / projectSpend` and is labeled `Distribución del gasto`. Never sum all node rollups (double counting). Initial segment refinement does not need a bar per node; rails and aligned numbers already encode the useful structure.

## K. Quick Capture

Preserve universal entry, default Gasto, one modal, shared global/project-context form, inline supplier creation and repeated entry. Recommended desktop width 640px, max-height within viewport; tablet near-full-width 16px outer margin. Header and full-width submit footer remain visible while body scrolls.

### Object types

Use compact icon + underline tabs in the current order: Gasto, Cliente, Proveedor, Personal, Proyecto, Segmento. Active tab has orange underline/strong label; idle tabs have no individual white pill borders. A separator after Gasto distinguishes the daily transaction from supporting records. All six remain one-tap reachable. At narrow width use two rows of three with the same selected styling and logical keyboard order; no clipped horizontal tab names. Tab switching with entered unsaved data offers discard/continue editing; it must not silently lose a draft.

### Project eligibility — explicit Class B behavior change

Current `getQuickAddData` excludes archived projects but includes finished non-archived projects. `parseExpenseForm` verifies existence and ownership but does not establish active-only creation. The screenshot reflects this existing rule, not a rendering accident.

**RECOMMENDED:** new expenses only target `status=ACTIVE AND archivedAt IS NULL`. Enforce in catalog, project-context affordance, and server create action, including a project becoming ineligible while a modal is open. Do not add this guard indiscriminately to shared parse/edit code: existing historical expense editing must remain possible with its project fixed. Archive is not a blanket read-only record conversion. `SegmentQuickForm` also calls `getQuickAddData`; separate the expense-eligible catalog from its segment-creation use (or parameterize the query explicitly) so active-only expense eligibility does not silently remove finalized projects from segment creation. Preserve existing segment creation rules unless separately authorized.

Finalized detail shows `Reabrí el proyecto para registrar un gasto nuevo`; archived detail says `Desarchivá el proyecto para registrar gastos nuevos` and, when also finalized, clarifies that reopening is additionally required. Neither action happens automatically. An empty catalog says `No hay proyectos activos disponibles para registrar gastos.` with `Ver proyectos` / create entry. No normal selectable finished/archived tiles; historical records stay retrievable in History/search.

### Vertical workflow

| Stage | Composition and behavior |
| --- | --- |
| Proyecto | Full-width pad; 2-column rectangular choices with name/client, selected check and orange edge. Five eligible projects fit without becoming a wizard. On selection, show compact project summary and explicit `Cambiar` control; catalog remains one tap away. Locked capture shows fixed project identity, never an empty/missing stage. |
| Segmento | Tree-aware list, not unrelated pills. Recent valid segment appears as a labeled shortcut above the tree, with full breadcrumb. Parent nodes remain selectable because they can own expenses. On project change discard incompatible segment and use current project's valid remembered/recent default; show the chosen path. If no segments, explain and link to the project’s segment section; never invent an unsegmented expense. |
| Monto | Dedicated white area, 56px minimum input, 32px tabular amount, persistent `₲` label. Numeric keyboard, existing integer parser, no decimals. Placeholder `150.000` is not a value. Focus amount when project/segment defaults are valid, otherwise first required stage. |
| Proveedor (opcional) | Compact chips with `Sin proveedor` first and selected by default, seven suppliers at existing density, `+ Nuevo proveedor` last. Selection uses check/border, not a second competing solid primary action. Inline new-name field appears in this pad and preserves the atomic capture path. |
| Fecha y nota | Quiet disclosure; summary always states date, e.g. `Hoy · Sin nota`. Explicit backdated value remains visible even when collapsed. Expands existing date and note fields; no attachment affordance. |

Each pad: heading + content, 16px inset and 16px separation, or a horizontal divider on a shared surface. Avoid four nested cards. Project/segment compression happens only after valid selection, never hides current attribution, and never advances to another page. Supplier remains visible by default.

### Commit and repeated entry

Footer button spans available width, height 48px, `Registrar gasto · ₲ 150.000 →` when amount parses; otherwise `Registrar gasto`. Empty/invalid amount can submit into an actionable inline validation message; disabled means pending or no valid project/segment catalog, not unexplained failure. Preserve button area during `Registrando…`.

On acknowledged success: keep modal open, project/segment remain if eligible, amount/note/new-supplier name clear, supplier resets to `Sin proveedor` as current behavior, focus returns to amount. Preserve explicit date within the open session and keep it visible; reopen initializes the normal date default. Session log reads `Registrado en esta sesión`, newest first, count and exact sum; it is not durable financial history. Use response-confirmed values for success feedback so UI reset cannot display a different amount. Actual durable retrieval remains project activity.

On rejection: retain all values, focus/announce the correction; a changed project status invalidates commit with a clear message and `Cambiar proyecto`. Do not silently pick another project. Do not automatically resubmit an uncertain network result. Closing after successful entries refreshes the underlying list/Panel as today. No wizard, new draft-persistence service, expense splitting, or supplier requirement.

## L. Client directory

`Clientes` header + count + `+ Nuevo cliente`; name search with clear action. Table: Nombre (primary), Teléfono, Proyectos activos, Proyectos vinculados. Name sort ascending by Spanish collation, toggle A–Z/Z–A; active-count sort numerical. Do not make telephone or relationship-list headings look sortable without implementing them. No client spend/revenue metric.

Record row opens right detail drawer, preserves filter/sort/scroll and highlights selected row. Name remains a semantic link; phone/link clicks do not also open the drawer. Drawer: Cliente kicker, name, Editar, phone/copy, RUC, notes, linked projects with separate lifecycle/archival labels; deletion below divider. Edit replaces drawer body with shared form and stable Save/Cancel footer, not a popup stacked over a drawer. Cancel returns to view; save refreshes row/detail without losing list context.

Keep `/clientes/[id]` directly addressable. Use that canonical URL for browser history/deep links with list-preserving presentation when opened from the directory; fresh direct load still produces usable record detail and `Volver a clientes`. Closing or Back restores list state. Do not break existing search/project links. Shared `DirectoryQuickForm` remains the field owner.

Delete copy states actual consequence: `Los proyectos se conservan y quedan sin cliente asignado.` Do not reuse supplier-expense wording for clients.

## M. Supplier directory

Same list/drawer navigation grammar, 560px detail maximum. Columns: Nombre, Teléfono, Proyectos vinculados; optional `Gasto registrado` column only when existing total is supplied consistently for all rows by the directory query. It must not be approximated from recent rows. If added, numerical sorting is required and classified as presentation-query work, no schema change.

Drawer: supplier identity/contact, recorded spend with exact expense count, project rows with amount spent per project, then expenses (date, project/full segment context, amount). Linked-with-no-expense project has `₲ 0`; unassigned expense is not attributed to a supplier. Relationship list is union of explicit links and expense association, not just ProjectSupplier links. Keep all-history scope visible: `Gastos registrados en todas las obras`; active Panel totals have a different scope.

No invoices, payables, payment status, vendor balances, or delivery performance metrics. Notes remain current directory notes. Delete copy: `Los gastos se conservan y quedan sin proveedor asignado. Se eliminan sus vínculos con proyectos.`

## N. Personnel directory

Use related list/drawer behavior but preserve existing `rol`: Nombre, Rol, Teléfono, Proyectos vinculados. Role is nullable text already supported; no new employee schema prerequisite. Show role under name in drawer; missing role says `Rol sin registrar` on detail and `—` with accessible explanation in the table.

Detail includes existing phone/RUC/notes and linked projects/status. Do not show spend, wages, utilization, schedules, assignments to phases, or labor hours: Employee has no expense relation. Delete copy: `Se eliminan sus vínculos con proyectos. Los proyectos y sus gastos se conservan.` A future personnel capability is not smuggled into a drawer redesign.

## O. History

Keep `/historial` and two visible sections in this order: `Finalizados · N`, then `Archivados · N`, separated by 32px and a rule. Both headings remain visible, including a concise empty state when only the other group has records. Add one name filter across groups; retain section totals and show filtered result counts clearly.

Finalized cards: completed check badge, full readable money, quiet completed-tone edge. Archived cards: archive badge primary, warm subdued surface/border, full-contrast name/amounts; underlying lifecycle shown separately as `Estado de obra: Activo/Finalizado` on detail, and where needed as secondary card text. No claim that an archived ACTIVE project completed construction.

Initial grouping is state then name, because no completion date exists. **Do not group finalized projects by `updatedAt`.** After dates, group by actual-completion month/year with `Fecha de finalización sin registrar` last. Archived projects can group by true `archivedAt` month/year if its timestamp is exposed in the read model; label it `Archivado en`, never `Finalizado en`. Do not conflate archive month and completion month. For the current one-record groups, retain simple sections; enable temporal subheadings when multiple periods actually exist.

## P. Panel

Question: `¿Cómo están mis obras?` Header shows `Cartera activa` scope explicitly. Keep the route primarily navigational/read-only; global Add remains available through shell.

### Money — Class A

1. One summary band: agreed total, recorded spend, recorded margin. Spend is strongest; agreed/margin are supporting. Active count sits in the header, not as a money-sized KPI. Explain `Margen registrado = precio acordado − gastos registrados`; no invoices, cash received, profit, or forecast.
2. `Requieren atención`: show individual projects with spend greater than agreed, amount exceeded, and project link, largest excess first. A positive portfolio margin must not hide one overrun. Empty state: `Sin obras con gasto superior al precio acordado` — not “all projects healthy.”
3. `Comparación de obras`: aligned rows with project/client, spend, agreed, margin, percentage and 6px bar. Default overrun first, remaining name ascending; optional explicit spend sorting. Bar says `Gasto / precio acordado`, each row's own denominator. Display true >100% text with capped width. Zero price yields `Sin precio acordado`, no artificial percent; positive spend still yields arithmetic excess.
4. `Dónde se concentra el gasto`: optional compact ranked horizontal bars by project using active-project spend divided by total active spend. Same common scale, exact amount + share text. Show all five fixture projects, including zero with no bar. When total is zero, say `Todavía no hay gastos registrados`; avoid 0/0. Reuse project aggregate input; no new analytics source or donut needed.
5. Recent activity: existing eight rows, full project/segment attribution and link. Label `Últimos 8 gastos de obras activas` when truncated; it is not the complete ledger.

The required first Panel slice includes 1–3 and 5. Include 4 only if it adds useful concentration reading without duplicating the comparison at tablet width; its precise calculation is specified, but it is a secondary enhancement, not a new prerequisite.

### Time — after B

Insert a compact active-portfolio timeline below attention and above comparison. One project row, shared month ruler, expected intervals/today marker per H, no phase inference. Adjacent text shows expected end and overdue days. Show incomplete-date projects in `Fechas incompletas (N)` rather than dropping them.

Attention categories are separate text labels: `Gasto excedido`, `Plazo previsto vencido`, `Finalización prevista en los próximos 14 días`. Fourteen calendar days is a display threshold, not a forecast or workflow state. If overdue, do not also classify as approaching. Both financial and temporal flags may coexist on a project row. Starting recently means start within the previous 14 calendar days, labeled as recorded start data, not verified progress. No phase summary until C exists.

### State and scope

Show compact links `Activos 5`, `Finalizados 1`, `Archivados 1`. These are mutually exclusive display groups using archival precedence (Q). Counts outside active scope require a small read-model extension using existing project data; they do not expand the money aggregate. History links navigate to their section; they do not silently change KPI scope. Empty active portfolio may still show History links.

SCENARIO reference totals for the dense fixture, not freshly queried in this checkpoint: active agreed `₲ 3.125.000.000`; spend `₲ 1.638.585.000`; margin `₲ 1.486.415.000`. All-project spend is `₲ 1.639.085.000`; archived Quincho accounts for the `₲ 500.000` difference. Finished Local has zero spend. Use these as regression expectations only after confirming the fixture has not legitimately changed.

## Q. Finalized vs archived

Archiving is orthogonal to lifecycle; keep `status` and `archivedAt` semantics. No third status enum in the visual slice.

| Persisted state | Display group / main badge | Contextual actions | New expense after eligibility slice |
| --- | --- | --- | --- |
| ACTIVE, no archive | Proyectos / Activo | Finalize; archive; edit; guarded delete | Allowed |
| FINISHED, no archive | Historial → Finalizados / Finalizado | Reopen; archive; edit; guarded delete | Blocked until reopen |
| ACTIVE, archived | Historial → Archivados / Archivado | Unarchive; retain underlying Activo; edit existing data as supported; guarded delete | Blocked until unarchive |
| FINISHED, archived | Historial → Archivados / Archivado | Unarchive; retain underlying Finalizado; edit existing data as supported; guarded delete | Blocked until unarchive and reopen |

On archived detail, lifecycle action is withheld until unarchive to keep the primary next step clear; this is presentation sequencing, not a claim that archive erased lifecycle. Unarchive preserves status and returns a finalized project to Finalizados. Reopen does not happen as a side effect. Existing expense edit and retained financial retrieval remain available.

`Archivar proyecto` is a distinct charcoal-outline action next to conservation text; destructive red is reserved for deletion. No routine confirmation needed for reversible archive/unarchive unless another unsaved draft would be lost. All state operations show pending/error/success and refresh affected list/history/Panel/capture catalog. Never infer lifecycle from money, dates, empty expenses, or phase status.

## R. Account / logout

Bottom sidebar section: small neutral session icon, `Acceso al estudio`, supporting `Sesión compartida`, divider and visible `Cerrar sesión` with logout icon. This is truthful session context, not a profile editor. Light red text on charcoal must meet contrast; never use dark red on dark background. In collapsed/narrow mode, menu exposes the same session area and explicit logout action. Maintain existing logout Server Action/session invalidation; no auth redesign, roles, avatar, settings page or named account prerequisites. Do not log out merely to verify this design checkpoint.

## S. Project type + location

Neither exists in current Project schema.

| Field | Recommended minimal persisted meaning | UX |
| --- | --- | --- |
| `workType` | Nullable constrained value: Vivienda, Reforma, Galpón, Local comercial, Depósito, Otro | Native select in create/edit after name; detail identity line; card secondary identity. Null = unknown, distinct from Otro. No auto-classification or custom taxonomy manager. |
| `location` | Nullable plain text address/locality, trimmed; recommend maximum 240 characters | Create/edit after client, label `Ubicación o dirección`; full text on detail; compact wrapped line on card. No geocoding or coordinates. |
| `startDate`, `expectedEndDate`, `actualEndDate` | Nullable date-only project facts with rules in H | Initial create offers start/expected end in optional `Fechas`; actual end in completion/edit-completed flow. |

Detail location actions: `Copiar dirección` with success/failure feedback, and `Buscar en mapas`, which opens an external map search for encoded address text on explicit click. It is a text search, not a verified site pin. Use a supported external HTTPS map-search URL; no background request, embedding, permission prompt, stored map URL, or mapping SDK. Name the external destination and mark new-tab behavior. No open/copy buttons when location is absent; provide `Agregar ubicación` via edit after metadata release.

General project create/edit stays compact: identity (name, type), client/location, agreed price (initial create only; read-only on edit), optional dates. Metadata never creates a PriceRevision. Do not backfill unknown fields from project names or test scenario prose. Update TECHNICAL_SPEC in that later domain slice, not this checkpoint.

## T. Responsive / tablet rules

| Available viewport | Shell and layout |
| --- | --- |
| ≥1200px | 224px persistent sidebar; content max 1280px; 24px gutters; cards use available-width grid |
| 768–1199px | Sidebar collapsed by default with explicit menu; persistent top-bar Add; content 20px gutters; normally two project cards if ≥616px content |
| <768px | Overlay navigation; 16px gutters; one card; full-width drawers; stacked money/date groups; primary identity always visible |

Breakpoints are not device detection. Preserve user sidebar choice where content remains usable. At tablet portrait, opening a drawer overlays the directory instead of shrinking columns into illegibility. Use sticky drawer/form controls with bottom safe-area padding and scroll focused fields above the virtual keyboard. Modal must fit dynamic viewport height.

Tables: at narrow width use record/expense row stacks with name/date/amount first and secondary relationships below. If a true comparison table requires local horizontal scroll, keep project name and a textual summary outside/at its leading edge. Page body must never scroll horizontally. Timeline may scroll locally, with obvious edge affordance and accessible controls. No essential tooltip-only data or hover-only action. At 200% zoom, amounts and action labels remain visible; allow vertical growth instead of fixed card height clipping.

## U. Microcopy

Use concise Spanish for Paraguay, sentence case, explicit objects, consistent terms. Existing familiar `Elegí`, `Agregá`, `Reabrí` can remain in helpers; action labels use infinitives.

| Context | Recommended wording |
| --- | --- |
| Finished label / history heading | `Finalizado` / `Finalizados` |
| Finish / success | `Marcar como finalizado` / `Obra finalizada` |
| Reopen / success | `Reabrir proyecto` / `Proyecto reabierto` |
| Archive explanation | `Se retira del espacio activo. Sus gastos y registros se conservan.` |
| Unarchive | `Desarchivar proyecto` |
| Archived finalized explanation | `Al desarchivarlo seguirá finalizado.` |
| Financial labels | `Gasto registrado`, `Precio acordado`, `Margen registrado`, `Excedido por` |
| Financial explanation | `Precio acordado menos gastos registrados. No representa la ganancia final.` |
| Ratio | `104% del precio acordado`; never `104% completado` |
| Supplier absence | `Sin proveedor` in capture; `—` with accessible “Sin proveedor” in compact table |
| New supplier | `+ Nuevo proveedor` |
| Date labels | `Fecha de inicio`, `Fecha estimada de finalización`, `Fecha real de finalización` |
| Date absence | `Fechas sin registrar`, `Fin previsto sin registrar`, `Fecha real sin registrar` |
| Time labels | `Tiempo`, `Hoy`, `Fin previsto`, `N días fuera del plazo previsto` |
| Segment amount labels | `Propio`, `Con subsegmentos` |
| Empty segments | `Todavía no hay segmentos. Agregá un segmento raíz para organizar los gastos.` |
| Capture success | `Gasto registrado` + exact project/segment/amount context |
| Session | `Acceso al estudio`, `Sesión compartida`, `Cerrar sesión` |
| Client delete | `Los proyectos se conservan y quedan sin cliente asignado.` |
| Personnel delete | `Se eliminan sus vínculos con proyectos. Los proyectos y sus gastos se conservan.` |

Do not turn expense description into a separate Note object, archive into deletion, recorded margin into profit, or Finalizado into Archivado. Search labels, project links, capture tags, edit selects, empty states and confirmation text must all receive the same terminology update.

## V. Known defect UX correction — OBR-FND-004

Recorded scenario: after Cimientos was refused deletion, the Excavación leaf displayed `tiene 1 subsegmento` although it had zero children and three expenses. Deletion remains safely blocked, but the explanatory wording carries the wrong context. No data-integrity failure is claimed and no fix occurs in OBR-UX-001.

Later slice must derive the displayed reason from current authoritative child/expense state when opening the action and after a blocked attempt. Where counts are available: `No se puede eliminar “{nombre}”: tiene {n} subsegmentos y {m} gastos registrados.` Omit zero clauses; singularize correctly. If counts are unavailable, use truthful generic `No se puede eliminar mientras tenga subsegmentos o gastos registrados.` Never assert zero children from a stale node snapshot.

Keep delete blocked by server and FK. Do not suggest deleting expenses as the preferred remedy. Explain `Podés reorganizar los subsegmentos o conservar este segmento para mantener su historial.` No cascade/force option. Refresh the relevant tree/dialog state after rename/reparent or rejection; retain the server's failure text inline. Acceptance requires separate child-only, expense-only, combined, and empty-leaf cases against a separately authorized disposable verification target, not destructive manipulation of the preserved dense fixture.

## W. Future product hooks

Only the following future hooks are reserved; no empty sidebar destinations or inert buttons now:

1. **Reusable structures V1:** `Copiar estructura de otra obra` creates only segment hierarchy in the destination. No expenses, client, agreed price, revisions, suppliers/personnel links, status, archive/date metadata, or financial history copied. Exact insertion/duplicate behavior belongs to that future slice.
2. **Templates V2:** saved segment structures by useful project type; no exhaustive taxonomy.
3. **Phases/durations V3:** after separate Phase decision, optional typical phases/durations and start-date-driven initial ranges, always explicitly adjusted by engineer; never automatic physical-progress inference.
4. **Follow-ups:** real site observations/issues, owners and due dates need their own product scope; do not misuse expenses/segments to record them.
5. **Attachments:** receipt/photo/document association with expenses; no fake upload affordance until storage/data contract exists.
6. **Pending client changes:** record unagreed requests separately from approved PriceRevision; do not revise price prematurely.
7. **Richer scheduling:** only when use justifies it; dependencies, daily resource scheduling and critical path remain excluded.

A future `Nueva obra → Tipo → Estructura → Fases/duraciones → Inicio → Ajustar` flow can extend the current creation form without changing the ownership of Project, Segment or Expense. This is direction, not implemented behavior.

## X. Implementation slices

Each slice requires its own authorized engineering checkpoint. Do not interpret this sequence as permission to execute now. Review the current source again before implementation; the inspected baseline can change.

### 1. Foundation + shell/session — Class A

- **Outcome:** consistent tokens, typography, action semantics, touch targets and accessible shared overlays; visible capture/session entry.
- **Surfaces:** `globals.css`, `AppShell`, `Popup`, shared buttons/inputs and badge usages.
- **Interactions:** collapse/mobile navigation, focus containment/restoration, dirty-dismiss confirmation, pending/error treatment, clear logout label.
- **Acceptance:** all six destinations and search work; Add accessible with sidebar closed; 44px hit areas; selected state understandable without color; keyboard/zoom/contrast checks; session copy makes no named-account claim.
- **Schema/domain:** none; reuse existing logout behavior.
- **Excluded:** auth changes, new font/dependency, profile page, metadata, phases, broad unrelated refactors.

### 2. Project list + lifecycle/history hierarchy — Class A

- **Outcome:** scannable responsive cards and distinct finalized/archived retrieval.
- **Surfaces:** `ProjectCard`, Proyectos, Historial, `StatusToggle`, `ProjectDangerZone`, shared state labels in directories/search.
- **Interactions:** contextual finalize/reopen/archive/unarchive wording, pending/error response; no repeated invalid lifecycle action.
- **Acceptance:** all four state combinations follow Q; five active fixture cards remain active-only; long names/full amounts fit; existing guard behavior remains; history groups separate. Existing expense eligibility stays unchanged until slice 4a.
- **Schema/domain:** none. Archival precedence is a display partition over existing fields.
- **Excluded:** dates inferred from timestamps; new status enum; new capture restriction hidden in this slice.

### 3. Project detail + segment refinement / OBR-FND-004 — Class A

- **Outcome:** clear money band, readable own/rolled-up cost tree and retained activity; accurate delete explanation.
- **Surfaces:** project detail, `SpendSummary`, `SegmentManager`, `ExpenseList`, `ProjectTeamPanel`, dialog error/state handling.
- **Interactions:** accessible tree actions, full-path reparent choices, price revision/history remains separate; truthful blocked-delete state.
- **Acceptance:** root/direct/descendant amounts remain exact; no rollup double count; three-level Casa hierarchy clear on tablet; deep path strategy verified separately; price remains immutable through general edit. Defect acceptance cases in V pass in authorized disposable tests.
- **Schema/domain:** none; a current guard-state read may be needed for accurate wording.
- **Excluded:** phase conversion, reparent algorithm rewrite without defect evidence, timeline, new deletion policy.

### 4a. New-expense eligibility contract — Class B, no schema

- **Outcome:** only active non-archived projects accept new expenses.
- **Surfaces:** `getQuickAddData`, `createExpense`, project-context capture entry and stale-form errors.
- **Interactions:** ineligible remembered project is rejected/reset visibly; no automatic reopen/unarchive. Server check protects direct/stale requests and must handle status changing during commit.
- **Acceptance:** both new-entry paths and forged/stale create request reject FINISHED/archived targets without inserting rows; existing historical expense editing still works with project fixed. Atomic inline supplier creation does not leave an orphan supplier on rejected expense.
- **Schema/domain:** domain capture-rule change; update TECHNICAL_SPEC in this slice and add meaningful action tests. No migration.
- **Excluded:** locking all history editing, automatic lifecycle changes, capture redesign beyond necessary messaging.

### 4b. Quick Capture visual/interaction refinement — Class A

- **Outcome:** distinct type/project/segment/supplier grammar, section pads, unmistakable commit, fast repeat entry.
- **Surfaces:** `UniversalAdd`, `ExpenseQuickForm`, `ChipPicker` variants, `QuickAddExpense`, `Popup` footer.
- **Interactions:** compression with explicit change, tree-based selection, visible remembered attribution, full-width submit, preserved/reset values per K.
- **Acceptance:** switching projects removes incompatible segment; parent segment remains selectable; supplier/no supplier/new supplier paths retain correct attribution; success adds one row and exact session sum; invalid/pending/error states preserve values; keyboard and tablet virtual keyboard work.
- **Schema/domain:** none beyond completed 4a.
- **Excluded:** wizard, multi-expense split, attachments, persistent draft infrastructure.

### 5. Directories + drawers — Class A

- **Outcome:** list-preserving record inspection/editing, consistent sort/search/navigation, truthful relationship/cost context.
- **Surfaces:** directory routes, `DirectoryTable`, drawer variant of shared overlay, shared directory form, detail body.
- **Interactions:** URL/back/close restores list; phone/project links independent; edit inside drawer; kind-specific delete explanations.
- **Acceptance:** all three populated directories, deep-link refresh and Back work; client relationships and supplier union/per-project totals remain correct; personal role retained and no cost metric invented; unsaved edits not lost silently.
- **Schema/domain:** none; read projection/sort and route work allowed. Preserve existing retrieval contract.
- **Excluded:** CRM fields, account model, payroll, new supplier billing semantics.

### 6. Money/state Panel redesign — Class A

- **Outcome:** active financial scope, individual overruns first, comparable project rows and contextual recent activity.
- **Surfaces:** `app/panel/page.tsx`, `getPanelData`, financial display primitives.
- **Interactions:** attention/project/history links; explicit sort controls if offered.
- **Acceptance:** independently reconcile active totals and excluded historic spend; one Galpón overrun remains visible despite positive portfolio margin; zero/over-100 cases readable; no fake trend data; tablet comparison readable.
- **Schema/domain:** none. Existing-field derived presentation and state-count projection only; calculation/filter meaning stays unchanged.
- **Excluded:** forecasts, cash flow, invoices, temporal analytics before dates, unrelated chart dependencies.

### 7. Project metadata/date foundation — Class B

- **Outcome:** optional type/location/start/expected/actual end with honest unknowns and lifecycle consistency.
- **Surfaces:** Project schema/migration, project actions/read models, shared project form and completion/reopen action, TECHNICAL_SPEC.
- **Interactions:** metadata editing, complete with explicit actual-date entry/unknown option, reopen clears completion date visibly, map/copy.
- **Acceptance:** existing rows migrate null; no automatic backfill; round-trip dates with timezone boundary checks; invalid ordering/future actual end rejected; both status entry paths consistent; archive does not change lifecycle dates; price revisions untouched.
- **Schema/domain:** required, isolated and authorized separately.
- **Excluded:** phases, templates, scheduling baselines, geocoding, physical-progress field, lifecycle audit log.

### 8. Project/portfolio temporal UX — presentation dependent on B

- **Outcome:** separate money/time card rows, project month/week ruler, portfolio date exceptions, date-aware history.
- **Surfaces:** project cards/detail, Panel, Historial; shared date calculations/ruler only as needed.
- **Interactions:** month/week switch, today/recenter, local range scroll; incomplete-date navigation.
- **Acceptance:** H cases including future start, missing dates, today=end, overdue active, completed early/late, archived and long/same-day range; fixed textual facts remain usable on tablet. No physical completion percentage or inferred phase.
- **Schema/domain:** no further fields beyond 7; derivation semantics from H documented in technical contract as appropriate.
- **Excluded:** phase rows, forecasts, drag scheduling, auto-status transitions.

### 9. Phase capability — Class C, explicit decision gate

- **Outcome:** project-owned phases and restrained horizontal ranges only if separate Phase recommendation is approved.
- **Surfaces:** separately scoped schema/actions/forms, time section, optional current-phase summary.
- **Interactions:** manual phase state/dates, parallel phases, named ranges; no accounting-tree conversion.
- **Acceptance:** phase/segment independence, overlap and missing-date handling; planned/actual distinction; no spend-to-progress inference; keyboard/tablet timeline access.
- **Schema/domain:** new domain capability; PRODUCT DECISION REQUIRED before engineering specification/migration.
- **Excluded:** every other hook in W, dependencies, critical path, resource scheduling.

Sequence rationale: visual work can proceed on existing facts; capture rule is isolated before new capture UI; metadata follows stable core screens and precedes temporal rendering. Phase work cannot block immediate refinement and must not be bundled with dates.

## Y. Visual verification plan

### For this document checkpoint

Checked recommendations against current source, all five attached images and supplied scenario evidence. Confirmed all A–Y sections, three scope classes, implementation dependencies, and explicit gates. Static checks confirmed all 25 required A–Y headings, no trailing whitespace, and the documented sample contrast ratios. No application build/test is required for a Markdown-only change, and no build script was run (the normal build includes migrations). No fresh browser/accessibility or database result is claimed.

### For subsequent implementation checkpoints

Before browsing, positively identify the runtime as loopback `obras_scenario_test` without revealing secrets; do not assume `.env` or the port proves it. Preserve the dense fixture. Read-only visual inspection may navigate, open/cancel forms, change view filters, expand trees and inspect existing rows. Do not save fake dates/expenses, finish/reopen/archive records, delete data, log out, reset or clean the dense workspace for screenshots.

Functional mutation tests need a separately authorized disposable clone/target. If unavailable, mark mutation-dependent acceptance **PARTIAL**; screenshots/builds cannot substitute. Temporal cases have no populated metadata in the existing fixture, so populated date/phase states require that later authorized test target. Do not silently seed the preserved fixture.

Capture paired before/after screenshots for the same state at 1440×900, 1024×768 landscape tablet, 768×1024 portrait tablet and 390×844 narrow fallback; also 200% zoom. Record actual available viewport and browser. Required states:

| Screen/state | Existing fixture / action | Acceptance evidence |
| --- | --- | --- |
| Shell | Proyectos; collapsed/open navigation | Six destinations; current marker; search; Add always reachable; session/logout visible without activating logout |
| Active cards | Five active projects | Long names, distinct status, full amounts, zero-activity Anteproyecto, no horizontal body overflow |
| Finalized | Local Ñandutí via Historial/detail | Finalizado badge; no finalize action; no eligible new-expense entry after 4a; existing records retrievable |
| Archived | Quincho Gómez | Archive section/badge; underlying lifecycle preserved; retained ₲ 500.000; unarchive label, no destructive test |
| Overrun | Galpón Norte | Exact current amount/excess and percentage; red exceptional marker; Panel attention visible despite positive aggregate margin. Use latest totals, not earlier single-expense screenshot figures |
| Tree | Casa → Obra gruesa → Cimientos → Excavación; Galpón Estructura | Parent/child rails, own vs rolled-up amounts, collapse/expand and touch controls; no double-counted visual distribution |
| Quick Capture | Open from Panel; switch Casa/Galpón; cancel | Distinct tabs/tiles/tree/chips, remembered path visible, no incompatible segment; full submit area and optional date visible with keyboard |
| Capture validation/repeat | Separate authorized disposable target | Invalid amount, missing segment, supplier-less/inline supplier, rapid double submit, server rejection, successful repeated entries, exact session sum and durable reload |
| Client drawer | Existing populated client | Open/edit/cancel/back/deep link; retained directory filter/scroll; nested phone/project links correct |
| Supplier drawer | Materiales Ybycuí and supplier with no spend | Exact total/project rows, all-history scope, missing phone, long name, expense links |
| Personal | Six personnel | Role displayed where present; no labor-cost inference; shared drawer grammar |
| History | Finalizados and Archivados populated | Separate headings/treatments; no completion grouping from updated timestamp; all records readable |
| Dense Panel | Existing five-active portfolio / eight recent rows | Active-only reconciliation, visible overrun, exact denominators, wrapped descriptions and long guaraníes |
| Dialog/accessibility | Any safe form opened, no save | Focus trap, Escape/close, restore focus, background inert, visible errors in disposable tests, no keyboard trap, reduced motion |
| Metadata/time | Later authorized date fixture | Missing dates, future start, start=end, expected end today, overdue, completion early/late/unknown, archive precedence, month/year/leap transitions |
| Phase | Only after phase approval and test setup | Upcoming/current/completed/parallel/undated/late ranges, stable names while ruler scrolls, no segment conversion |

Automated checks in later code slices: existing lint/typecheck; select build/verify commands only after checking side effects and target. Add focused tests for active-only creation vs historical edit, date arithmetic/validation, state partition, and any changed guard. Do not write tests that merely mirror CSS. Visual acceptance needs actual browser interaction and screenshots; financial or persistence acceptance needs independent read-only reconciliation after authorized mutation tests.

### Handoff decision

**READY FOR UX/UI REVIEW.** The immediate visual direction is implementation-ready for review. Minimal prerequisites and the separate Phase decision are explicit. New live UI inspection remains unverified because the running database target was not safely established; this is recorded rather than inferred. No application implementation was performed.
