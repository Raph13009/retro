create table if not exists public.keep_alive (
  id bigint generated always as identity primary key,
  pinged_at timestamptz not null default now()
);

alter table public.keep_alive enable row level security;

drop policy if exists "keep alive insert" on public.keep_alive;
create policy "keep alive insert" on public.keep_alive
  for insert to anon, authenticated
  with check (true);
