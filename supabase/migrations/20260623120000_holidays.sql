-- Agency Events: holidays. (CLAUDE.md → Events feature, Google Sheets sync.)
--
-- The Agency Events drawer has two tabs:
--   * Holidays  — read from this table. A team member maintains the list in a
--     Google Sheet; a scheduled Edge Function will mirror the sheet into this
--     table (sheet = source of truth — added in a later step). For now the
--     2026 set below is seeded by hand so the feature works end to end.
--   * Birthdays — derived from profiles.birthdate, no table needed.
--
-- Some holidays fall on a weekend and the day off transfers to the next
-- working day. We store the real `holiday_date` plus an optional
-- `observed_date` (the actual day off); the app shows the day off and notes
-- the original date when they differ. `observed_date` is null when the holiday
-- isn't moved.

create table public.holidays (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  holiday_date date not null,
  observed_date date,
  emoji        text,
  synced_at    timestamptz not null default now()
);

comment on table public.holidays is
  'Public holidays shown in the Agency Events drawer. Mirrored from a team Google Sheet (sheet is source of truth). observed_date is the transferred day off when a holiday lands on a weekend.';

-- Listed/sorted by the effective day off (observed_date falls back to holiday_date).
create index holidays_date_idx on public.holidays (coalesce(observed_date, holiday_date));

alter table public.holidays enable row level security;

-- Visible to every signed-in user; manual writes are admin-only. The sync runs
-- with the service role, which bypasses RLS.
create policy "holidays_select_authenticated"
  on public.holidays for select to authenticated using (true);
create policy "holidays_write_admin"
  on public.holidays for all to authenticated
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

grant select, insert, update, delete on public.holidays to authenticated;

-- 2026 Ukrainian public holidays. Sundays transfer to the next Monday
-- (Easter, Trinity, Constitution Day) via observed_date.
insert into public.holidays (name, holiday_date, observed_date, emoji) values
  ('New Year',                    '2026-01-01', null,         '🎉'),
  ('Orthodox Easter',             '2026-04-12', '2026-04-13', '⛪'),
  ('International Workers'' Day',  '2026-05-01', null,         '🌷'),
  ('Memorial Day',                '2026-05-08', null,         '🕯️'),
  ('Orthodox Trinity',            '2026-05-31', '2026-06-01', '⛪'),
  ('Ukraine Constitution Day',    '2026-06-28', '2026-06-29', '📜'),
  ('Day of Ukrainian Statehood',  '2026-07-15', null,         '🇺🇦'),
  ('Ukraine Independence Day',    '2026-08-24', null,         '🇺🇦'),
  ('Defender''s Day of Ukraine',  '2026-10-01', null,         '🛡️'),
  ('Christmas',                   '2026-12-25', null,         '🎄');
