-- Slice 1: Client Directory
-- This schema deliberately contains only the client record needed for create,
-- directory, detail, and edit. No future-module tables are created here.

create schema if not exists practice_management;

create table if not exists practice_management.clients (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(btrim(nombre)) > 0),
  apellido text not null check (char_length(btrim(apellido)) > 0),
  telefono text,
  email text,
  notas text,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function practice_management.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists clients_set_updated_at on practice_management.clients;
create trigger clients_set_updated_at
before update on practice_management.clients
for each row execute function practice_management.set_updated_at();

-- Authentication and authorization are intentionally deferred. This migration
-- does not enable RLS; do not deploy client data before auth/RLS policy
-- is introduced in a later, explicitly approved slice.
