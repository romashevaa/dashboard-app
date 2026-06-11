-- The "All logins" section is now a movable section whose position derives
-- from the service order (anchored at its first single-login service). The
-- previous backfill was alphabetical, which would interleave singles among
-- groups and could surface "All logins" above the group sections. Re-rank so
-- grouped services (>= 2 logins) come first and single-login services after,
-- preserving the existing relative order within each class — i.e. exactly the
-- layout the page has shown so far. Admins can move sections freely from here.

with counts as (
  select s.id, count(c.id) as logins
  from public.services s
  left join public.credentials c on c.service_id = s.id
  group by s.id
),
ranked as (
  select
    s.id,
    row_number() over (
      order by (case when counts.logins >= 2 then 0 else 1 end), s.sort_order
    ) as rn
  from public.services s
  join counts on counts.id = s.id
)
update public.services s
set sort_order = ranked.rn
from ranked
where s.id = ranked.id;
