# UX Contract — Client Directory

## Product context

- Audience: independent Paraguayan service professionals.
- Active locale: Spanish (`es-PY`); all owned UI and accessible labels are Spanish.
- Accessibility target: WCAG 2.2 AA baseline.
- Source: `docs/PRODUCT.md`, `docs/WORKFLOWS.md`, the Slice 1 request, and the tutor predecessor's stated visual grammar.

## Canonical UI map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Form | `ClientForm` in `src/App.jsx` | This contract | Create and edit share validation and submit behavior. | Browser validation states. |
| Select/Listbox | Native `<select>` | This contract | Native only; accepted for the two-state `Estado` field. | Keyboard and native popup. |
| Scrollbar | `src/styles.css` | `DESIGN.md` | Global baseline only. | Computed stylesheet inspection. |
| Toast | Inline `role=status` / `role=alert` in `App` | This contract | Success and error messages only. | Browser live-region inspection. |
| CRUD | `client-api.js` + `App` | `docs/WORKFLOWS.md` | Pessimistic create/edit; refresh reads from Supabase. | Full flow after Supabase setup. |
| Search/filter/sort | `App` directory controls | This contract | Local, transient view controls until a server-side contract exists. | Browser interaction check. |

## Flow ledger

| Operation | Pending | Success | Failure recovery |
| --- | --- | --- | --- |
| Create | Save button disabled with `Guardando…` | Detail view opens and directory updates | Preserve form values and show inline error. |
| Edit | Save button disabled with `Guardando…` | Updated detail view opens | Preserve form values and show inline error. |
| Load | Stable loading row | Directory list appears | Inline loading error explains the failed operation. |
| Cancel | None | Returns to detail/list without saving | None. |
| Demo create/edit | Save button disabled while applying | Visible during this browser session only | Message clearly states it was not persisted. |

## Validation and resilience

Forms use `noValidate`, require name and surname, validate an entered email, attach field errors to their inputs, and prevent duplicate saves. Search, filter, and sort are local/transient because no server-side list contract exists. No autosave, offline queue, deletion, authentication, or authorization behavior exists in this slice. When Supabase is absent, a visibly labeled in-memory demo record permits UI-only review; it is not a persistence substitute.
