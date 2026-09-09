-- Slice 4: Payments record money actually received from a Client.
-- They are not invoices, balances, debt, Session prices, or earned revenue.
create table if not exists practice_management.payments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references practice_management.clients(id),
  fecha date not null,
  monto numeric(14, 0) not null check (monto > 0),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_client_id_idx
  on practice_management.payments (client_id);

drop trigger if exists payments_set_updated_at on practice_management.payments;
create trigger payments_set_updated_at
before update on practice_management.payments
for each row execute function practice_management.set_updated_at();

-- Data API exposure and development grants are configured separately. Do not
-- grant DELETE or add Payment-to-Session/Appointment relationships in this slice.
