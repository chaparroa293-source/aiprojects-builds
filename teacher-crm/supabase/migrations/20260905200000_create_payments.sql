begin;

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null,
  amount bigint not null check (amount > 0 and amount <= 9007199254740991),
  payment_date date not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, client_id, user_id),
  constraint payments_client_owner_fkey foreign key (client_id, user_id)
    references public.clients (id, user_id) on delete cascade
);

create index payments_owner_date_idx on public.payments (user_id, payment_date desc);
create index payments_client_date_idx on public.payments (client_id, payment_date desc);
alter table public.payments enable row level security;
create policy "Users can view their own payments" on public.payments
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add their own payments" on public.payments
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own payments" on public.payments
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can remove their own payments" on public.payments
  for delete to authenticated using ((select auth.uid()) = user_id);

alter table public.classes add column payment_id uuid;
alter table public.classes add constraint classes_payment_client_owner_fkey
  foreign key (payment_id, client_id, user_id)
  references public.payments (id, client_id, user_id)
  on delete set null (payment_id);
create index classes_payment_idx on public.classes (payment_id);

-- One transaction: failed or concurrent class selection rolls back the whole save.
-- SECURITY INVOKER retains the caller's existing RLS permissions.
create function public.save_payment(
  p_id uuid, p_client_id uuid, p_amount bigint, p_payment_date date,
  p_notes text, p_class_ids uuid[]
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  payment_uuid uuid;
  selected_ids uuid[] := coalesce(p_class_ids, '{}'::uuid[]);
  matched integer;
begin
  if auth.uid() is null then raise exception 'Authentication required.'; end if;
  if p_id is null then
    insert into public.payments (user_id, client_id, amount, payment_date, notes)
      values (auth.uid(), p_client_id, p_amount, p_payment_date, p_notes)
      returning id into payment_uuid;
  else
    select id into payment_uuid from public.payments
      where id = p_id and user_id = auth.uid() and client_id = p_client_id for update;
    if payment_uuid is null then raise exception 'Payment not found or Client changed.'; end if;
  end if;

  perform id from public.classes
    where id = any(selected_ids) or payment_id = payment_uuid order by id for update;
  select count(*) into matched from public.classes
    where id = any(selected_ids) and client_id = p_client_id and user_id = auth.uid()
      and (payment_id is null or payment_id = payment_uuid);
  if matched <> cardinality(selected_ids) then
    raise exception 'A selected class is unavailable, belongs to another Client, or is already linked to another payment. Reload and review your selection.';
  end if;

  update public.payments set amount = p_amount, payment_date = p_payment_date,
    notes = p_notes, updated_at = now() where id = payment_uuid;
  update public.classes set payment_id = null, updated_at = now()
    where payment_id = payment_uuid and not (id = any(selected_ids));
  update public.classes set payment_id = payment_uuid, updated_at = now()
    where id = any(selected_ids) and payment_id is distinct from payment_uuid;
  return payment_uuid;
end;
$$;
revoke all on function public.save_payment(uuid, uuid, bigint, date, text, uuid[]) from public;
grant execute on function public.save_payment(uuid, uuid, bigint, date, text, uuid[]) to authenticated;

commit;
