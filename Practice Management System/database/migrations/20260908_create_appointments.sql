-- Slice 3: Scheduling foundation. Appointments are planned work, not Sessions.
create table if not exists practice_management.appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references practice_management.clients(id),
  fecha date not null,
  hora_inicio time not null,
  duracion_minutos integer check (duracion_minutos is null or duracion_minutos > 0),
  estado text not null check (estado in ('programada', 'cancelada')),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists appointments_client_id_idx
  on practice_management.appointments (client_id);
create index if not exists appointments_schedule_idx
  on practice_management.appointments (fecha, hora_inicio);

drop trigger if exists appointments_set_updated_at on practice_management.appointments;
create trigger appointments_set_updated_at
before update on practice_management.appointments
for each row execute function practice_management.set_updated_at();

-- Data API exposure and development grants are configured separately. Do not
-- grant DELETE or add Appointment-to-Session automation in this slice.
