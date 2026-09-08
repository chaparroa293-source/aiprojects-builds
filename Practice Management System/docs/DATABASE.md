# Database

This document describes physical database implementation. The canonical logical contract is [TECHNICAL_SPEC.md](../TECHNICAL_SPEC.md).

Supabase Postgres is selected for Slice 1. The database project is **AI Builds**, a shared Supabase project used by multiple independent applications. The local application connection is verified. Migration `database/migrations/20260908_create_clients.sql` has been applied.

## Current schema

`practice_management.clients` stores `id` (UUID), required `nombre` and `apellido`, optional `telefono`, `email`, and `notas`, `estado` (`activo` or `inactivo`, default `activo`), plus `created_at` and `updated_at` timestamps. `practice_management.set_updated_at()` refreshes `updated_at` on updates.

`practice_management.sessions` stores a direct required `client_id` foreign key to `clients`, required `fecha` and `hora_inicio`, optional `duracion_minutos` (when supplied it must be positive), required `estado` (`programada`, `completada`, or `cancelada`), optional `notas`, and timestamps. `sessions_client_id_idx` supports client-history reads, and `sessions_set_updated_at` reuses the scoped timestamp function. Session has no payment fields and no Appointment table exists.

`practice_management` is this application's dedicated namespace. Its migrations must operate only within that schema unless an explicit shared dependency is approved later; this application must not inspect or alter tables/schemas belonging to other AI Builds applications. The Data API exposes this schema plus only `clients` and `sessions`; automatic exposure for new tables is off. The development `anon` role has `USAGE` on this schema and `SELECT`, `INSERT`, and `UPDATE` on these tables; it has no `DELETE` grant. Authentication and production RLS are deferred; these tables have no RLS and must not be treated as production-safe.
