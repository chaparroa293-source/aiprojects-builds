# Practice Management System

A reusable practice-management system for independent, session-based service professionals. Slices 1–2 implement a persisted Client Directory and client-owned Session history in the shared AI Builds Supabase project.

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
- Implemented workflows: create, list, view, edit, and reload a persisted client; record, view, edit, and reload sessions within that client's detail.
- Authentication and deployment remain deferred.
