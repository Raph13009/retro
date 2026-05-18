-- Group-level votes/reactions: target either card_id OR group_id (exactly one).
-- Action items can reference a group (group_id) instead of a single card.

begin;

drop trigger if exists sync_card_vote_count on public.votes;
drop trigger if exists sync_group_vote_count on public.votes;

-- --- card_groups.vote_count ---
alter table public.card_groups add column if not exists vote_count integer not null default 0;
alter table public.card_groups drop constraint if exists card_groups_vote_count_check;
alter table public.card_groups add constraint card_groups_vote_count_check check (vote_count >= 0);

-- --- votes: nullable card_id, add group_id ---
alter table public.votes drop constraint if exists votes_card_id_fkey;
alter table public.votes alter column card_id drop not null;

alter table public.votes add column if not exists group_id uuid references public.card_groups(id) on delete cascade;

-- Migrate existing votes on grouped cards onto the group (dedupe per participant per group)
update public.votes v
set group_id = c.group_id, card_id = null
from public.cards c
where v.card_id = c.id and c.group_id is not null;

delete from public.votes a
using public.votes b
where a.id > b.id
  and a.room_id = b.room_id
  and a.group_id = b.group_id
  and a.participant_id = b.participant_id
  and a.group_id is not null;

alter table public.votes drop constraint if exists votes_room_id_card_id_participant_id_key;

alter table public.votes drop constraint if exists votes_target_xor;
alter table public.votes add constraint votes_target_xor check (
  (card_id is not null and group_id is null) or (card_id is null and group_id is not null)
);

create unique index if not exists votes_room_card_participant_uidx on public.votes (room_id, card_id, participant_id)
  where card_id is not null;

create unique index if not exists votes_room_group_participant_uidx on public.votes (room_id, group_id, participant_id)
  where group_id is not null;

alter table public.votes
  add constraint votes_card_id_fkey foreign key (card_id) references public.cards(id) on delete cascade;

-- --- reactions ---
alter table public.reactions drop constraint if exists reactions_card_id_fkey;
alter table public.reactions alter column card_id drop not null;
alter table public.reactions add column if not exists group_id uuid references public.card_groups(id) on delete cascade;

update public.reactions r
set group_id = c.group_id, card_id = null
from public.cards c
where r.card_id = c.id and c.group_id is not null;

delete from public.reactions a
using public.reactions b
where a.id > b.id
  and a.room_id = b.room_id
  and a.group_id = b.group_id
  and a.participant_id = b.participant_id
  and a.emoji = b.emoji
  and a.group_id is not null;

alter table public.reactions drop constraint if exists reactions_room_id_card_id_participant_id_emoji_key;

alter table public.reactions drop constraint if exists reactions_target_xor;
alter table public.reactions add constraint reactions_target_xor check (
  (card_id is not null and group_id is null) or (card_id is null and group_id is not null)
);

create unique index if not exists reactions_room_card_participant_emoji_uidx on public.reactions (room_id, card_id, participant_id, emoji)
  where card_id is not null;

create unique index if not exists reactions_room_group_participant_emoji_uidx on public.reactions (room_id, group_id, participant_id, emoji)
  where group_id is not null;

alter table public.reactions
  add constraint reactions_card_id_fkey foreign key (card_id) references public.cards(id) on delete cascade;

-- --- action_items.group_id ---
alter table public.action_items add column if not exists group_id uuid references public.card_groups(id) on delete set null;
alter table public.action_items drop constraint if exists action_items_card_id_key;
create unique index if not exists action_items_card_id_uidx on public.action_items (card_id) where card_id is not null;
create unique index if not exists action_items_group_id_uidx on public.action_items (group_id) where group_id is not null;

alter table public.action_items drop constraint if exists action_items_target_xor;
alter table public.action_items add constraint action_items_target_xor check (not (card_id is not null and group_id is not null));

-- --- triggers: replace vote count sync ---
drop trigger if exists sync_card_vote_count on public.votes;
drop trigger if exists sync_group_vote_count on public.votes;

create or replace function public.sync_card_vote_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.card_id is not null then
      update public.cards set vote_count = vote_count + 1 where id = new.card_id;
    end if;
    return new;
  end if;
  if old.card_id is not null then
    update public.cards set vote_count = greatest(0, vote_count - 1) where id = old.card_id;
  end if;
  return old;
end;
$$;

create or replace function public.sync_group_vote_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    if new.group_id is not null then
      update public.card_groups set vote_count = vote_count + 1 where id = new.group_id;
    end if;
    return new;
  end if;
  if old.group_id is not null then
    update public.card_groups set vote_count = greatest(0, vote_count - 1) where id = old.group_id;
  end if;
  return old;
end;
$$;

create trigger sync_card_vote_count
after insert or delete on public.votes
for each row execute function public.sync_card_vote_count();

create trigger sync_group_vote_count
after insert or delete on public.votes
for each row execute function public.sync_group_vote_count();

-- Recompute counts from votes (post-migration safety)
update public.cards c
set vote_count = coalesce((select count(*)::int from public.votes v where v.card_id = c.id), 0);

update public.card_groups g
set vote_count = coalesce((select count(*)::int from public.votes v where v.group_id = g.id), 0);

commit;
