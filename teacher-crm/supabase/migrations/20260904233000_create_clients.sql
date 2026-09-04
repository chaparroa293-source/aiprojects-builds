create table public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  student_name text not null check (char_length(trim(student_name)) > 0),
  status text not null default 'Prospect' check (status in ('Prospect', 'Current', 'Former')),
  payer_contact_name text,
  relationship_to_student text,
  phone_whatsapp text,
  school text,
  grade_year text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_user_created_at_idx on public.clients (user_id, created_at desc);

alter table public.clients enable row level security;

create policy "Users can view their own clients"
  on public.clients for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own clients"
  on public.clients for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own clients"
  on public.clients for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
