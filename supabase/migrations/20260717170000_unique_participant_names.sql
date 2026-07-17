-- Deduplicate existing same-room names, then enforce uniqueness.
-- Keeps the oldest participant row; renames later duplicates so FKs stay intact.

with ranked as (
  select
    id,
    name,
    room_id,
    row_number() over (
      partition by room_id, lower(name)
      order by created_at asc, id asc
    ) as duplicate_rank
  from public.participants
)
update public.participants as p
set name = ranked.name || ' (' || ranked.duplicate_rank || ')'
from ranked
where p.id = ranked.id
  and ranked.duplicate_rank > 1;

create unique index if not exists participants_room_id_lower_name_uidx
  on public.participants (room_id, lower(name));
