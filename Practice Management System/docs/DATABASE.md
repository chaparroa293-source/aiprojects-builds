# Database

A real Postgres-backed database is expected, but no provider is selected or connected. Supabase is a leading candidate; Neon is another candidate. Do not use both without an explicit architectural reason.

No schema or migrations exist. Future data changes must be driven by an approved vertical slice, model observed cardinality, distinguish source from derived values, and document decisions here.
