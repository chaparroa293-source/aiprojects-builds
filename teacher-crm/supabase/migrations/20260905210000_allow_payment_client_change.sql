create or replace function public.save_payment(
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
      where id = p_id and user_id = auth.uid() for update;
    if payment_uuid is null then raise exception 'Payment not found.'; end if;
  end if;

  perform id from public.classes
    where id = any(selected_ids) or payment_id = payment_uuid order by id for update;
  select count(*) into matched from public.classes
    where id = any(selected_ids) and client_id = p_client_id and user_id = auth.uid()
      and (payment_id is null or payment_id = payment_uuid);
  if matched <> cardinality(selected_ids) then
    raise exception 'A selected class is unavailable, belongs to another Client, or is already linked to another payment. Reload and review your selection.';
  end if;

  update public.classes set payment_id = null, updated_at = now()
    where payment_id = payment_uuid;
  update public.payments set client_id = p_client_id, amount = p_amount,
    payment_date = p_payment_date, notes = p_notes, updated_at = now()
    where id = payment_uuid;
  update public.classes set payment_id = payment_uuid, updated_at = now()
    where id = any(selected_ids);
  return payment_uuid;
end;
$$;
