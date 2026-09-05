alter table public.clients
  add constraint clients_id_user_id_key unique (id, user_id);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null,
  class_date date not null,
  start_time time without time zone not null,
  duration_minutes integer not null check (duration_minutes > 0),
  status text not null default 'Scheduled' check (status in ('Scheduled', 'Completed', 'Cancelled', 'Missed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_client_owner_fkey
    foreign key (client_id, user_id)
    references public.clients (id, user_id)
    on delete cascade
);

create index classes_user_date_time_idx
  on public.classes (user_id, class_date, start_time);

create index classes_client_date_time_idx
  on public.classes (client_id, class_date, start_time);

alter table public.classes enable row level security;

create policy "Users can view their own classes"
  on public.classes for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own classes"
  on public.classes for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own classes"
  on public.classes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table public.regular_schedule_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null,
  weekday smallint not null check (weekday between 1 and 7),
  start_time time without time zone not null,
  duration_minutes integer not null check (duration_minutes > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint regular_schedule_slots_client_owner_fkey
    foreign key (client_id, user_id)
    references public.clients (id, user_id)
    on delete cascade
);

create index regular_schedule_slots_client_time_idx
  on public.regular_schedule_slots (client_id, weekday, start_time);

alter table public.regular_schedule_slots enable row level security;

create policy "Users can view their own regular schedule slots"
  on public.regular_schedule_slots for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own regular schedule slots"
  on public.regular_schedule_slots for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own regular schedule slots"
  on public.regular_schedule_slots for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own regular schedule slots"
  on public.regular_schedule_slots for delete to authenticated
  using ((select auth.uid()) = user_id);
