-- PMS-S04: a recorded Payment may be linked to many Sessions of its Client.
alter table practice_management.sessions
  add column if not exists payment_id uuid null;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'sessions_payment_id_fkey'
      and conrelid = 'practice_management.sessions'::regclass
  ) then
    alter table practice_management.sessions
      add constraint sessions_payment_id_fkey
      foreign key (payment_id) references practice_management.payments(id)
      on delete set null;
  end if;
end $$;

create or replace function practice_management.assert_session_payment_client()
returns trigger language plpgsql as $$
begin
  if new.payment_id is not null and not exists (
    select 1 from practice_management.payments
    where id = new.payment_id and client_id = new.client_id
  ) then raise exception 'Session payment must belong to the same client'; end if;
  return new;
end;
$$;

drop trigger if exists sessions_payment_client_check on practice_management.sessions;
create trigger sessions_payment_client_check
before insert or update of client_id, payment_id on practice_management.sessions
for each row execute function practice_management.assert_session_payment_client();

create index if not exists sessions_payment_id_idx on practice_management.sessions (payment_id);
