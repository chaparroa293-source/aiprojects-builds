-- Slice 2: Session history
-- Sessions belong directly to one Practice Management client. No scheduling,
-- appointment, payment, or future-module objects are introduced here.

create table if not exists practice_management.sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references practice_management.clients(id),
  fecha date not null,
  hora_inicio time not null,
  duracion_minutos integer check (duracion_minutos is null or duracion_minutos > 0),
  estado text not null check (estado in ('programada', 'completada', 'cancelada')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_client_id_idx
  on practice_management.sessions (client_id);

drop trigger if exists sessions_set_updated_at on practice_management.sessions;
create trigger sessions_set_updated_at
before update on practice_management.sessions
for each row execute function practice_management.set_updated_at();

-- Authentication and authorization remain deferred. Browser access must be
-- limited separately to SELECT, INSERT, and UPDATE for the development anon
-- role; do not grant DELETE.
