---
version: alpha
name: "Practice Management System"
description: "A Spanish-language client directory that evolves the tutor predecessor's calm operational shell for Paraguayan professionals."
colors:
  # Neutrals — light operational canvas
  ink: "#1B2430"
  ink-soft: "#54626F"
  muted: "#7A8794"
  canvas: "#F6F8FB"
  surface: "#FFFFFF"
  border: "#E4E9F0"
  border-strong: "#D2DBE6"
  # Deep ink / navy — dark navigation shell + high-contrast anchors
  navy: "#1A2333"            # sidebar rail (the deepest surface in the app)
  navy-raised: "#27324A"     # active nav surface on the rail
  navy-anchor: "#233348"     # Pagos "Total recibido" block — same family, deliberately lighter than the rail
  nav-text: "#DCE3EF"        # primary navigation labels
  nav-muted: "#8D9BB0"       # secondary sidebar text
  nav-icon: "#8593A8"        # inactive icons, quieter than labels
  nav-accent: "#5B9BFF"      # active edge + focus ring on the dark rail
  # Blue — primary action / link / selection / focus
  primary: "#2F6FEB"
  primary-hover: "#245AD0"
  primary-soft: "#EAF1FE"
  primary-ink: "#2357C9"
  focus: "#1F5FE0"
  # Semantic families — soft background + stronger foreground + optional tint-family border
  teal: "#0B6F6A"        # completed · received · positive · saved   (success is an alias of teal)
  teal-soft: "#E2F3F1"
  amber: "#B5761B"       # scheduled · today · planned · attention (never danger)
  amber-soft: "#FBEFD9"
  amber-wash: "#FDF6EA"  # the "today" calendar column tint
  coral: "#B8544A"       # cancelled
  coral-soft: "#F9E8E5"
  danger: "#BD4A3F"      # errors / destructive (coral family, marginally redder)
  danger-soft: "#F8E7E4"
  lavender: "#6B5BD0"    # Quick Capture identity + contextual secondary accents
  lavender-soft: "#EEEBFB"
  lavender-wash: "#FAF8FF"
  peach-ink: "#96552C"   # demo / informational notices
  peach-soft: "#FDECE0"
  sky: "#1F7AA8"         # secondary informational surfaces (linked-session summary, locked-client)
  sky-soft: "#E4F2F8"
typography:
  display:
    fontFamily: "Avenir Next, Segoe UI, Roboto, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, ui-sans-serif, system-ui, sans-serif"
    character: "Geometric-leaning humanist sans; confident but restrained. Page titles ~1.5rem, not editorial-poster scale."
  sans:
    fontFamily: "Avenir Next, Segoe UI, Roboto, -apple-system, BlinkMacSystemFont, Helvetica Neue, Arial, ui-sans-serif, system-ui, sans-serif"
rounded:
  sm: "0.375rem"
  DEFAULT: "0.5625rem"
  lg: "0.75rem"
spacing:
  page-max: "70rem"
  page-gutter: "2rem"
components:
  button: {}
  input: {}
  client-list: {}
  detail-panel: {}
  drawer: {}
  sidebar: {}
---

# Practice Management System Design System

## Overview

### Creative North Star

**Distinctive Light Workspace.** The product should feel light, calm, spacious, operational, professional, and modern — distinctive without being decorative. The predecessor's calm, ledger-like operational register is retained; its dark-green editorial treatment is not. Visual personality comes from typography, proportion, spacing, restrained accent use, and interaction polish — not from large colored surfaces. The workspace is white / soft cool off-white with very pale blue-grey supporting surfaces; blue is an accent and system colour, never a background field.

### Product context and register

- **Audience and primary job:** Paraguayan independent service professionals recording and retrieving client/session details quickly.
- **Target market and locale:** Paraguay; Spanish (`es-PY`). All owned UI copy is Spanish. Future currency uses PYG (`₲ 150.000`).
- **Register:** Product. Familiar form and directory behavior take priority over decoration.
- **Memorable signature:** A deep cool-navy navigation rail anchoring a bright, information-dense light workspace, with restrained semantic colour (teal / amber / coral / lavender / peach / sky) carried on the information itself.
- **Restraint:** Data entry, errors, and status remain plain and legible; no dashboard treatment. The only motion is the create/edit drawer's short slide-in, which is removed under `prefers-reduced-motion`.
- **Token ownership/runtime mapping:** This file is the visual source of truth; `src/styles.css` is its direct runtime adapter. Token changes must update both.

## Colors

**Dark navigation → light workspace → coloured information.** The application shell (`navy`) is the single deepest surface: a cool blue-charcoal rail, not green, not black. Against it the `surface`-white / `canvas` off-white workspace reads brighter and more deliberate. Colour then lives on the *information* inside that workspace, never as decoration.

**Sidebar.** Base `navy`. Labels `nav-text` (near-white, ≥12:1). Secondary text `nav-muted` blue-grey. Inactive icons `nav-icon`, quieter than labels. Active item = a `navy-raised` panel with a 3px `nav-accent` (bright blue) edge — clearly lifted from the rail, never a large saturated blue block. Hover is a faint translucent-white lift. Quick Capture keeps a restrained lavender treatment in the rail (tinted surface + lavender text/icon). The `brand-mark` keeps the blue identity square. Account/footer is readable but secondary. Focus on the rail uses `nav-accent`. The collapsed 60px rail and the ≤820px dark top strip use the same treatment.

**Semantic families.** Each family is *soft background + stronger related foreground + optional tint-family border*, applied to small elements (chips, dots, left accents, tinted info cards, one summary block) — never large saturated fills:

| Family | Meaning | Where |
| --- | --- | --- |
| `navy` | navigation shell, high-contrast anchors | sidebar; `navy-anchor` for the Pagos `Total recibido` block (lighter than the rail, teal-accented) |
| `primary` (blue) | action · link · selection · focus | primary buttons, contact links, selected directory row (blue inset accent), tabs, focus ring |
| `teal` / mint | completed · received · positive · saved | `activo` / `completada` chip, `Pago registrado →`, WhatsApp chip, saved `notice`, revealed-Payment accent |
| `amber` / gold | scheduled · today · planned | `programada` status, the "today" column (`amber-wash`) + "Hoy" marker |
| `coral` / soft red | cancelled · destructive · errors | `cancelada` chip/dot, `error-message`, field-invalid |
| `lavender` / purple | Quick Capture identity + contextual accents | QC panel wash + left edge + eyebrow + selected mode + `＋ Nuevo cliente`; client initials |
| `peach` | demo / informational notices | `demo-message` |
| `sky` / pale cyan | secondary informational surfaces | linked-session summary, locked-client panel |

`focus` is the keyboard ring only, never a content or "today" treatment. Status is never colour-only — the text label (and, in calendar cards, a dot) is always present. All chip and sidebar foreground/background pairs meet WCAG AA.

## Typography

One geometric-leaning humanist sans stack covers display and body. Headings are confident but held small — page titles ~1.35rem, section headings ~1rem — with slightly negative tracking; no editorial-poster scale, no serif. A compact scale carries the rest: field label / eyebrow ~0.63–0.66rem uppercase micro-caps in `muted`; primary data ~0.86–0.9rem `ink`; metadata / helper ~0.78–0.83rem `muted`. Weight (600–700 vs 400) and colour (`ink` vs `muted`) carry hierarchy more than size. Controls keep natural Spanish sentence case; no all-caps action labels.

## Density & rhythm

The app is an operational workspace, not a presentation deck: the reader should see more useful information before scrolling. Vertical rhythm is tight but not cramped — page-header ~16px, section gaps ~12–14px, form field gaps ~12px, table/list rows ~36–40px. Breathing room is spent on separating *groups*, not padding every element. Prefer thin dividers and a single quiet container over per-item bordered cards; a section is `title → (optional summary) → records`, not a stack of floating cards.

## Layout

The shell is a **dark navy** sidebar rail on tablet-landscape and wider, collapsing to a dark top navigation strip at ≤820px. An explicit `☰` control in the rail header toggles the navigation: on rail widths it collapses to a 64px icon-only rail (labels, brand text and account text hidden; the three destinations stay reachable as icons); on the ≤820px strip the same control shows/hides the wrapped nav row. The choice persists (`localStorage`), defaults to collapsed on narrow widths, and auto-collapses after navigating on narrow widths. This `☰` is distinct from the drawer's `×`. Every active page follows eyebrow → compact sans title → short explanation → primary action → operational surface. The Clients surface is a directory table on a single quiet container beside a borderless detail column; the detail column is suppressed entirely until a client is selected so the directory reads as the primary workspace. Directory sorting lives on the `Cliente` and `Estado` column headers (button + `aria-sort`, click to toggle asc/desc, a chevron on the active column and a neutral `⇅` on other sortable ones); there is no separate sort dropdown. Client Detail keeps restrained Datos/Agenda/Sesiones/Pagos tabs; persisted phone and email render as `tel:` / `wa.me` / `mailto:` links (see Components). Calendario is one bordered card: a single compact header row (left: identity + week range; right: the Anterior/Hoy/Siguiente segmented group then the `Nueva cita` primary), then seven day columns on wide screens and vertically grouped days at ≤1180px, with no forced horizontal grid scrolling.

## Elevation & Depth

Restrained elevation on four levels — always *subtle border + low-opacity shadow*, never large blurred SaaS card shadows, and never scattered onto every element:

- **L0** — page canvas: no border, no shadow.
- **L1** (`--shadow-1`) — the main work surfaces: the Client-detail workspace panel, the directory table frame, the Calendar frame, the Session/Payment list frame, Quick Capture. A hairline border plus a barely-there shadow so each reads as a distinct plane above the canvas.
- **L2** (`--shadow-2`) — interactive cards on hover/active: a calendar appointment lifts on hover; a selected/revealed row takes a soft tint + a 3px inset accent bar.
- **L3** — the right-side drawer: the one strong shadow, over a light scrim.

## High-contrast anchors

Two dark surfaces exist, both from the navy family: the persistent **navigation rail** (`navy`, the deepest) and, per screen, at most **one summary block** that should read before anything else. Today the summary is the Pagos `Total recibido` block: `navy-anchor` ground (deliberately lighter than the rail so the two read as related, not identical), white ~1.55rem total, muted blue-grey label + secondary explanation, a 3px `teal` inset accent tying it to the payment colour. It is a summary, not a call to action, and introduces no invoice/balance/debt meaning. Do not add a second summary dark block to a view, do not use this treatment for ordinary records, and do not let the workspace itself go dark — the point of the dark rail is the bright canvas beside it.

## Tables & lists

Structured data reads as a dense, calm grid, not a set of cards. One thin outer frame; rows separated by hairlines, no per-row border; row height ~36–40px; header is a quiet tinted strip with `~0.63rem` uppercase labels and preserved sortable-header affordances (`aria-sort` + chevron, neutral `⇅` on other sortable columns). Hover is a faint wash; the selected/revealed row is a soft tint plus a 3px inset accent bar (blue for the directory selection, teal for a revealed Payment) — obvious but not loud. Wide content scrolls inside its own container; the page never scrolls sideways.

## Shapes

Fields, buttons, the segmented control, and status chips use `sm`; cards, containers, list frames, and the drawer use `DEFAULT`/`lg`. Nothing is a full pill any more — status chips and the "Hoy" marker are small rounded rectangles with a restrained tint-family border. Radii are kept modest (6–12px); avoid rounded-everything styling.

## Components

Buttons have native semantics, visible focus, stable busy dimensions, and primary/secondary/ghost hierarchy. Exactly one `primary` (filled blue) button appears per surface; everything else is `secondary` (outline) or `ghost` (blue text). Search has an owned clear action. Inputs use associated labels and inline Spanish errors. The native date, time, and state/select controls are intentional. Textareas do not resize. Saved and failure messages use stable inline live regions. Demo data is visibly labeled and never presented as persisted information.

**Record actionability.** Anything presented as a distinct persisted object — a Client row, an Appointment (Calendar or Agenda), a Session, a Payment — is a real `<button>`: `cursor:pointer`, a hover wash (`primary-soft` + a right inset accent), visible focus, and an `aria-label` naming what opens ("Editar sesión del …"). The row/card opens that object's primary detail/edit context; explicitly *related* labels are separate sibling buttons that navigate to the related object (`Pago registrado →` opens the linked Payment, never the Session editor) — never nested inside the row button. Contact links (`tel:`/`mailto:`/`wa.me`) sit in their own cells and never trigger row selection. Client Detail also carries an explicit compact `Editar`; the list rows rely on click + the aria-label rather than a per-row button, to stay dense.

**Contained Client workspace.** The Datos/Agenda/Sesiones/Pagos tabs and their content are one L1 panel (surface + hairline + `--shadow-1`), with the tabs as a tinted header strip rounded into the panel top. Record lists inside it drop their own shadow and bleed to the panel edges (dividers, not a second box) so it reads as *tabs → one workspace*, not stacked cards.

**Right-side drawer.** Create/edit of operational data that has workspace context uses a panel that enters from the right over a light scrim, keeping the underlying workspace visible (never a centered modal, never wide enough to erase that context — ~430px on desktop/tablet, full-width at ≤560px). Every drawer has an eyebrow + title, an explicit top-right `×` labelled "Cerrar", a single primary save, and a secondary "Cancelar". Close affordances (`×`, Cancelar, scrim click, Escape) all mean the same thing — discard and close — so no "Cerrar sin guardar" variant is used. Validation and pessimistic-save behaviour are unchanged from the inline forms the drawer reuses. This is the standard for Add/Edit Client and every Appointment create/edit (Calendar and Client Agenda); Sessions, Payments, and Quick Capture remain inline for now.

**Create-a-Client escape hatch.** Where a flow needs a Client that doesn't exist yet — Quick Capture and Nueva cita (including day-specific "Agregar cita") — a `＋ Nuevo cliente` beside the Client selector opens the standard Client create drawer *on top of* the unfinished form (both drawers mounted; the nested one owns Escape, so the draft survives). On save the nested drawer closes, the new Client is auto-selected, and every value already entered is preserved. It reuses the one `ClientForm`; Client stays its own object created through the normal path.

**Lifecycle language.** Hard delete is unsupported (DB/API/product); the create/edit forms say so in one line and point to the available lifecycle transition instead — Client → `Inactivo`, Appointment/Session → `Cancelada`. Payment has no void/delete action and none is implied.

Calendar appointment cards use time as the lead datum, then Client, explicit status text with a small colour dot, and optional duration — calm white cards with a hairline border, no heavy fills or left bars. Cancelled appointments remain visible but read secondary (muted `coral` dot, faint ground). Today is a subtle `amber` column tint plus a small `amber` "Hoy" pill — never the focus-ring style. The contextual per-day "Agregar cita" is a subordinate blue dashed-outline button (min 36px, clearly interactive on touch) — lower weight than the global `Nueva cita`, but a real target, not a text sliver. When no Client exists yet, the per-day actions and `Nueva cita` are replaced by a single clear `Agregar cliente` path (toolbar button + guidance banner) rather than disabled-looking controls.

**Contact links.** In Client Detail the persisted phone renders as a `tel:` link plus two lightweight chips — `Llamar` (`tel:`) and `WhatsApp` (`https://wa.me/<number>`, new tab); email renders as a `mailto:` link. In the Client Directory table the phone and email cells are themselves `tel:` / `mailto:` links (readable formatting kept, no chips — the table stays quiet). The number is normalised for the URL only (digits, local `0` → `595`); the stored `telefono` value is never rewritten. These are links, not CTAs — no messaging, sending, history, or automation.

**Duration entry.** Wherever the optional `duracion_minutos` is edited (Appointment, Session, Quick Capture) the same `DurationField` is used: a row of preset pills (30 / 45 / 60 / 90 min) above the existing free-entry number input. A preset sets the value; clicking the active preset clears it; a typed non-preset value is kept verbatim — no coercion, no closed dropdown, still optional.

**Duration touch target.** `DurationField` presets are ~40px tall for tablet use. In a `.form-grid` the field spans the full row (`grid-column:1/-1`) so all four presets sit on one line above a full-width manual input; the Estado field immediately after it also spans full width, keeping Fecha/Hora as the only paired row.

**Status chips.** One shape everywhere: a small rounded rectangle (`sm` radius), `~0.7rem` 600-weight text, a soft tint background and a 1px border from the same tint family, single line. Never an oversized pill. The text label is always present; colour follows the Estado map below. Calendar cards, where space is tight, use the dot-plus-text variant of the same colours instead of the chip.

**Estado colour.** State is carried by the supporting palette everywhere it appears, always with its text label: `activo` / `completada` → `teal`, `programada` → `amber`, `cancelada` → `coral`, `inactivo` → `muted`. Directory/table and Client Detail use the status chip; the Estado `<select>` in each form gets a 3px left border in the current value's colour. No saturated colored form or card surfaces.

**Session → Payment.** When a Session references a Payment, the list shows `Pago registrado →` as a small teal button (not plain text). It switches to the Pagos tab and reveals the exact linked Payment — the row gets a teal outline + `aria-current` and scrolls into view. If the Payment is not in the loaded set the label renders as plain muted text (no dead link) and, on a stale click, an inline notice explains it is unavailable.

**Practitioner identity.** The rail's account block (`practitioner` constant, `data-placeholder`) is a styled placeholder shaped to later consume an authenticated practitioner/workspace profile (avatar, name, secondary line). It is not final product identity and no auth/profile modelling exists yet.

## Do's and Don'ts

- **Do:** keep the path to creating a client visible and short.
- **Do:** use Spanish labels and explicit recovery copy.
- **Do:** use the right-side drawer for operational create/edit that benefits from keeping the workspace visible; give it one primary action and an explicit `×`.
- **Don't:** introduce dashboard cards, charts, or other future-module surfaces.
- **Don't:** hide keyboard focus, rely on colour alone for state, or reuse the focus ring as a content or "today" treatment.
- **Don't:** replace the former large green areas with large blue areas — blue stays an accent.
- **Do:** keep the sidebar the single deepest surface (cool navy, not green, not black); everything else stays light.
- **Do:** use the full semantic set (teal/amber/coral/lavender/peach/sky) where meaning supports it — soft background + stronger foreground + optional tint border — but never as large fills or per-module colour-coding.
- **Don't:** give per-day "Agregar cita" the same visual weight as the global `Nueva cita`, or render it as a disabled-looking sliver.
- **Do:** confine the supporting palette (amber/teal/lavender/coral) to chips, dots, small accents and tinted info cards; large surfaces stay neutral.
- **Do:** favour density — thin dividers, one quiet frame, compact rows — over stacks of individually bordered cards.
- **Do:** allow exactly one high-contrast dark anchor per screen, and only for a summary (today: Pagos `Total recibido`).
- **Don't:** grow headings back toward editorial scale, add per-row card borders, or round corners past ~12px.
- **Do:** treat the sidebar `☰` and the drawer `×` as different controls with different meanings.
- **Don't:** rewrite a stored contact value to build a link — normalise for the URL only.
