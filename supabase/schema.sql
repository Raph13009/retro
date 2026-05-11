create extension if not exists "pgcrypto";

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  creator_participant_id uuid,
  current_phase text not null default 'reflect' check (current_phase in ('reflect', 'group', 'vote', 'discuss', 'writing', 'voting', 'discussion', 'finished')),
  hide_cards_during_writing boolean not null default false,
  cards_revealed boolean not null default false,
  vote_limit integer not null default 3 check (vote_limit >= 0 and vote_limit <= 20),
  timer_duration_seconds integer not null default 300 check (timer_duration_seconds > 0),
  timer_started_at timestamptz,
  timer_paused_remaining_seconds integer not null default 300 check (timer_paused_remaining_seconds >= 0),
  timer_status text not null default 'idle' check (timer_status in ('idle', 'running', 'paused', 'ended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  name text not null,
  avatar_color text not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rooms_creator_participant_id_fkey'
  ) then
    alter table public.rooms
      add constraint rooms_creator_participant_id_fkey
      foreign key (creator_participant_id) references public.participants(id)
      on delete set null;
  end if;
end;
$$;

create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.card_groups (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  column_id uuid not null references public.columns(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  column_id uuid not null references public.columns(id) on delete cascade,
  group_id uuid references public.card_groups(id) on delete set null,
  author_participant_id uuid not null references public.participants(id) on delete cascade,
  content text not null,
  vote_count integer not null default 0,
  sort_order integer not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  alter table public.cards add column if not exists group_id uuid;
  alter table public.cards add column if not exists position integer not null default 0;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'cards_group_id_fkey'
  ) then
    alter table public.cards
      add constraint cards_group_id_fkey
      foreign key (group_id) references public.card_groups(id)
      on delete set null;
  end if;
end;
$$;

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (room_id, card_id, participant_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  participant_id uuid not null references public.participants(id) on delete cascade,
  emoji text not null check (emoji in ('👍', '❤️', '👀', '🔥', '✅')),
  created_at timestamptz not null default now(),
  unique (room_id, card_id, participant_id, emoji)
);

create table if not exists public.action_items (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  card_id uuid references public.cards(id) on delete set null,
  title text not null,
  assignee_participant_id uuid references public.participants(id) on delete set null,
  status text not null default 'todo' check (status in ('todo', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (card_id)
);

create index if not exists participants_room_id_idx on public.participants(room_id);
create index if not exists columns_room_id_sort_order_idx on public.columns(room_id, sort_order);
create index if not exists card_groups_room_id_column_id_position_idx on public.card_groups(room_id, column_id, position);
create index if not exists cards_room_id_column_id_sort_order_idx on public.cards(room_id, column_id, sort_order);
create index if not exists cards_room_id_group_id_position_idx on public.cards(room_id, group_id, position);
create index if not exists votes_room_id_participant_id_idx on public.votes(room_id, participant_id);
create index if not exists comments_room_id_card_id_idx on public.comments(room_id, card_id);
create index if not exists reactions_room_id_card_id_idx on public.reactions(room_id, card_id);
create index if not exists action_items_room_id_idx on public.action_items(room_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists set_cards_updated_at on public.cards;
create trigger set_cards_updated_at
before update on public.cards
for each row execute function public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
before update on public.comments
for each row execute function public.set_updated_at();

drop trigger if exists set_action_items_updated_at on public.action_items;
create trigger set_action_items_updated_at
before update on public.action_items
for each row execute function public.set_updated_at();

create or replace function public.sync_card_vote_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.cards
    set vote_count = vote_count + 1
    where id = new.card_id;
    return new;
  end if;

  update public.cards
  set vote_count = greatest(0, vote_count - 1)
  where id = old.card_id;
  return old;
end;
$$;

drop trigger if exists sync_card_vote_count on public.votes;
create trigger sync_card_vote_count
after insert or delete on public.votes
for each row execute function public.sync_card_vote_count();

create or replace function public.enforce_vote_limit()
returns trigger
language plpgsql
as $$
declare
  allowed_votes integer;
  used_votes integer;
begin
  select vote_limit into allowed_votes
  from public.rooms
  where id = new.room_id;

  select count(*) into used_votes
  from public.votes
  where room_id = new.room_id
    and participant_id = new.participant_id;

  if used_votes >= allowed_votes then
    raise exception 'Vote limit reached for this room';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_vote_limit on public.votes;
create trigger enforce_vote_limit
before insert on public.votes
for each row execute function public.enforce_vote_limit();

do $$
begin
  alter table public.rooms drop constraint if exists rooms_current_phase_check;
  alter table public.rooms
    add constraint rooms_current_phase_check
    check (current_phase in ('reflect', 'group', 'vote', 'discuss', 'writing', 'voting', 'discussion', 'finished'));

  alter table public.cards add column if not exists group_id uuid;
  alter table public.cards add column if not exists position integer not null default 0;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'cards_group_id_fkey'
  ) then
    alter table public.cards
      add constraint cards_group_id_fkey
      foreign key (group_id) references public.card_groups(id)
      on delete set null;
  end if;
end;
$$;

alter table public.rooms enable row level security;
alter table public.participants enable row level security;
alter table public.columns enable row level security;
alter table public.card_groups enable row level security;
alter table public.cards enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.action_items enable row level security;

drop policy if exists "rooms are link accessible" on public.rooms;
create policy "rooms are link accessible" on public.rooms
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "participants are link accessible" on public.participants;
create policy "participants are link accessible" on public.participants
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "columns are link accessible" on public.columns;
create policy "columns are link accessible" on public.columns
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "cards are link accessible" on public.cards;
create policy "cards are link accessible" on public.cards
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "card groups are link accessible" on public.card_groups;
create policy "card groups are link accessible" on public.card_groups
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "votes are link accessible" on public.votes;
create policy "votes are link accessible" on public.votes
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "comments are link accessible" on public.comments;
create policy "comments are link accessible" on public.comments
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "reactions are link accessible" on public.reactions;
create policy "reactions are link accessible" on public.reactions
  for all to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "action items are link accessible" on public.action_items;
create policy "action items are link accessible" on public.action_items
  for all to anon, authenticated
  using (true)
  with check (true);

grant usage on schema public to anon, authenticated;
grant all on public.rooms to anon, authenticated;
grant all on public.participants to anon, authenticated;
grant all on public.columns to anon, authenticated;
grant all on public.card_groups to anon, authenticated;
grant all on public.cards to anon, authenticated;
grant all on public.votes to anon, authenticated;
grant all on public.comments to anon, authenticated;
grant all on public.reactions to anon, authenticated;
grant all on public.action_items to anon, authenticated;

alter table public.rooms replica identity full;
alter table public.participants replica identity full;
alter table public.columns replica identity full;
alter table public.card_groups replica identity full;
alter table public.cards replica identity full;
alter table public.votes replica identity full;
alter table public.comments replica identity full;
alter table public.reactions replica identity full;
alter table public.action_items replica identity full;

do $$
declare
  publication_table_name text;
begin
  foreach publication_table_name in array array[
    'rooms',
    'participants',
    'columns',
    'card_groups',
    'cards',
    'votes',
    'comments',
    'reactions',
    'action_items'
  ]
  loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = publication_table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', publication_table_name);
    end if;
  end loop;
end;
$$;
