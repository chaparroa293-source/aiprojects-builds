# Database

Supabase Postgres is selected for Slice 1. The database project is **AI Builds**, a shared Supabase project used by multiple independent applications. The local application connection is verified. Migration `database/migrations/20260908_create_clients.sql` has been applied.

## Current schema

`practice_management.clients` stores `id` (UUID), required `nombre` and `apellido`, optional `telefono`, `email`, and `notas`, `estado` (`activo` or `inactivo`, default `activo`), plus `created_at` and `updated_at` timestamps. `practice_management.set_updated_at()` refreshes `updated_at` on updates.

`practice_management` is this application's dedicated namespace. Its migrations must operate only within that schema unless an explicit shared dependency is approved later; this application must not inspect or alter tables/schemas belonging to other AI Builds applications. The Data API exposes this schema and `clients` table only; automatic exposure for new tables is off. The development `anon` role has only `USAGE` on this schema and `SELECT`, `INSERT`, and `UPDATE` on this table; it has no `DELETE` grant. There are no relationships or tables for future modules. Authentication and production RLS are deferred; the table has no RLS and must not be treated as production-safe.
