# Practice Management System

A Spanish-first practice-management system for independent, session-based professionals, initially oriented toward individual practitioners in Paraguay. It is the practitioner's operational workspace and memory, not primarily a CRM.

## Start here

- [Product definition](docs/PRODUCT.md)
- [Canonical technical specification](TECHNICAL_SPEC.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Environment map](docs/ENVIRONMENT.md)
- [Build log](docs/BUILD_LOG.md)

## Run locally

```sh
npm run dev
```

Use `npm run build` for the production build. Local configuration belongs in the ignored `.env.local`; variable names are in `.env.example`.

## Current state

- Tracked as a project folder in the parent `aiprojects-builds` repository on `main`.
- GitHub remote: `origin` (`https://github.com/chaparroa293-source/aiprojects-builds.git`).
- Stack: React, Vite, npm, and Supabase Postgres.
- Implemented workflows: Client Directory and Detail; client-owned Appointments, Sessions, and Payments; a Monday–Sunday weekly Calendar over Appointments; Session ↔ Payment association; Quick Capture of ordinary Sessions and Payments; and a `+ Nuevo cliente` escape hatch from Nueva cita and Quick Capture.
- Interaction model: a dark navigation shell over a light, information-dense workspace; right-side create/edit drawers (with a nested Client drawer where a Client must be created mid-flow); every record opens its own detail/edit context. Hard deletion is intentionally not exposed — Client/Appointment/Session use lifecycle states (`inactivo` / `cancelada`); a Payment void/reversal lifecycle is not yet defined.
- Latest slice: PMS-UX-007 (connected-record actionability + surface polish), verified end-to-end against the connected Supabase environment (PMS-TEST-001 hand test).
- Authentication, RLS hardening, and deployment remain deferred.
