---
version: alpha
name: "Practice Management System"
description: "A Spanish-language client directory that evolves the tutor predecessor's calm operational shell for Paraguayan professionals."
colors:
  ink: "#172B35"
  sidebar: "#1E4938"
  primary: "#286044"
  primary-hover: "#1E5139"
  surface: "#FFFFFF"
  canvas: "#F4F0E7"
  border: "#DED8CA"
  focus: "#BD8737"
  success: "#205E43"
  danger: "#8B3027"
typography:
  display:
    fontFamily: "Georgia, Times New Roman, serif"
  sans:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
rounded:
  sm: "0.375rem"
  DEFAULT: "0.5rem"
  lg: "0.75rem"
spacing:
  page-max: "70rem"
  page-gutter: "2rem"
components:
  button: {}
  input: {}
  client-list: {}
  detail-panel: {}
---

# Practice Management System Design System

## Overview

### Creative North Star

The tutor predecessor application is the visual reference implementation: a dark-green persistent sidebar and warm workspace containing calm, readable operational surfaces. This product generalizes that system; it does not introduce a competing design direction.

### Product context and register

- **Audience and primary job:** Paraguayan independent service professionals creating and retrieving client details quickly.
- **Target market and locale:** Paraguay; Spanish (`es-PY`). All owned UI copy is Spanish. Future currency uses PYG (`₲ 150.000`).
- **Register:** Product. Familiar form and directory behavior take priority over decoration.
- **Memorable signature:** The predecessor's dark-green application spine beside a warm, ledger-like client workspace.
- **Restraint:** Data entry, errors, and status remain plain and legible; no dashboard treatment or decorative animation.
- **Token ownership/runtime mapping:** This file is the visual source of truth; `src/styles.css` is its direct runtime adapter. Token changes must update both.

## Colors

`sidebar` owns the persistent application spine. `primary` drives safe primary actions and `focus` is reserved for visible keyboard focus. `success` and `danger` communicate saved and error states with text, never color alone. The interface uses warm `canvas`, `surface`, and `border` values for quiet structural separation.

## Typography

`display` gives route and section headings a modest register-like character. `sans` handles forms, labels, and data. Controls retain natural Spanish sentence case; no all-caps action labels.

## Layout

The shell uses a persistent sidebar on desktop and a compact navigation strip on narrow screens. Every active page follows eyebrow → serif title → short explanation → primary action → operational surface. The Clients surface adds controls, a readable table, and a detail/form panel; it becomes sequential on narrow screens.

## Elevation & Depth

Borders and tonal contrast establish hierarchy. Static surfaces use no shadows.

## Shapes

Fields and buttons use `sm`; the directory container uses `lg`. Status chips are the only pill-shaped element.

## Components

Buttons have native semantics, visible focus, stable busy dimensions, and primary/secondary hierarchy. Search has an owned clear action. Inputs use associated labels and inline Spanish errors. The native state/select controls are intentional: platform-owned popups are acceptable for these small option sets. Textareas do not resize. Saved and failure messages use stable inline live regions. Demo data is visibly labeled and never presented as persisted information.

## Do's and Don'ts

- **Do:** keep the path to creating a client visible and short.
- **Do:** use Spanish labels and explicit recovery copy.
- **Don't:** introduce dashboard cards, charts, or other future-module surfaces.
- **Don't:** hide keyboard focus or rely on color alone for client state.
