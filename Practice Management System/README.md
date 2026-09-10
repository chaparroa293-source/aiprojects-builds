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
- Implemented workflows: Client Directory and Detail; client-owned Appointments, Sessions, and Payments; Session ↔ Payment association; and Quick Capture of ordinary Sessions and Payments.
- Latest completed slice: PMS-S05 Quick Capture (`555dc0d`).
- Authentication and deployment remain deferred.
