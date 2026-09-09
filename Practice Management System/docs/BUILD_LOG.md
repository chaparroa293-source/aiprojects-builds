# Build log

## 2026-09-08 — Foundation initialized

- Created the project foundation as an ordinary folder in the parent `aiprojects-builds` repository on `main`.
- Added the documentation skeleton, profession notes, empty source/database directories, and secret-safe `.gitignore`.
- Clarified the distinction between product truth, code truth, and data truth.
- Left frontend, package manager, database, authentication, deployment, and GitHub remote unselected.
- No product workflow, UI, schema, dependency stack, infrastructure connection, or deployment was created.

## 2026-09-08 — Slice 1: Client Directory

- Added the React + Vite application, Spanish (`es-PY`) client directory UI, and Supabase client integration.
- Added the minimal `clients` migration and `.env.example`; no credentials or Supabase project configuration were added.
- Authentication, RLS policy, deployment, and all modules beyond Client Directory remain deferred.

## 2026-09-08 — Shared Supabase namespace correction

- Corrected the unexecuted Client Directory migration and client calls to use the dedicated `practice_management` schema in the shared AI Builds Supabase project.
- No Supabase credentials, connection, migration execution, or live database action occurred.

## 2026-09-08 — Slice 1 persistence verified

- Applied the scoped migration to the shared AI Builds project, creating only `practice_management.clients` and its local timestamp function/trigger.
- Exposed only `practice_management` and `clients` through the Data API; automatic exposure for future tables is off.
- Verified fake-client create, direct database row, directory/detail read, edit, and browser reload persistence through the browser-facing `anon` role.
- Authentication and production RLS remain deferred; this is development/testing only.

## 2026-09-08 — Slice 1 checkpoint

- Removed the single fake persistence-verification client after confirming create, read, edit, reload, filter, and sort behavior; the directory returned to its empty state.
- Client Directory remains development-only: browser access is limited to `SELECT`, `INSERT`, and `UPDATE`; authentication, ownership, RLS, and production hardening are deferred.

## 2026-09-08 — Slice 2: Session history

- Applied the scoped `practice_management.sessions` migration with a direct `client_id` foreign key, status constraint, optional duration, client-history index, and the existing scoped `updated_at` behavior.
- Exposed only `sessions` in the existing `practice_management` Data API namespace and granted the development browser role only `SELECT`, `INSERT`, and `UPDATE`.
- Verified fake client/session create, empty history, no-duration entry, all allowed states, direct database read, edit, and reload persistence. Scoped fake records were removed after verification.

## 2026-09-08 — Slice 3A: Appointment foundation + Client Agenda

- Confirmed the live scoped `practice_management.appointments` table, FK, constraints, indexes, and `updated_at` trigger against the local migration; no migration rerun was needed.
- Explicitly exposed only `practice_management.appointments` through the existing Data API configuration; automatic exposure remains off. The development `anon` role has only `SELECT`, `INSERT`, and `UPDATE` on appointments; an unexpected DELETE privilege was revoked and confirmed absent.
- Verified fake client/appointment empty Agenda, create, direct ownership and NULL-duration read, edit, reload persistence, UI validation, no client-reassignment control, and database rejection of an unsupported status. Scoped fake records were removed and confirmed absent.
- Global Agenda, Appointment → Session conversion, Payments, authentication, and production RLS remain unimplemented.

## 2026-09-09 — Slice 4: Client Payments

- Applied the scoped `practice_management.payments` migration with a direct `client_id` foreign key, `numeric(14,0)` positive-amount constraint, client-payment index, and the scoped `updated_at` trigger.
- Explicitly exposed only `practice_management.payments` through the existing Data API configuration; automatic exposure remains off. The development `anon` role has only `SELECT`, `INSERT`, and `UPDATE`; it has no `DELETE` grant.
- Verified a fake client’s empty Pagos state, required/non-positive validation, create, blank notes as `NULL`, direct ownership, PYG formatting and total, edit, and reload persistence. The two fake payments and matching fake client were removed and confirmed absent.
- Global Payments, authentication, and production RLS remain unimplemented.
