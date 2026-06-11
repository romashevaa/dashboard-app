-- Manual ordering for the Credentials page (admin drag/move):
--   services.sort_order    — order of service groups (and of singles in
--                            "All logins"), page-wide.
--   credentials.sort_order — order of logins within their service.
--
-- Existing rows are backfilled to match the order the page showed until now
-- (alphabetical), so nothing visibly jumps when this lands. New rows append
-- at the end (handled in the app's server actions).

alter table public.services
  add column sort_order integer not null default 0;

alter table public.credentials
  add column sort_order integer not null default 0;

with ranked as (
  select id, row_number() over (order by lower(name)) as rn
  from public.services
)
update public.services s
set sort_order = ranked.rn
from ranked
where s.id = ranked.id;

with ranked as (
  select
    id,
    row_number() over (
      partition by service_id
      order by lower(coalesce(account, username))
    ) as rn
  from public.credentials
)
update public.credentials c
set sort_order = ranked.rn
from ranked
where c.id = ranked.id;

create index credentials_service_sort_idx
  on public.credentials (service_id, sort_order);

-- No new RLS needed: reordering is an UPDATE, already admin-only via the
-- existing services_write_admin / credentials_write_admin policies.
