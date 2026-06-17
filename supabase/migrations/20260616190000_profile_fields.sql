-- Profile fields for the member self-onboarding flow.
--
-- New users are nudged (welcome modal + a red dot on the account button) to
-- fill in who they are. `welcomed_at` records that the welcome was shown/
-- dismissed so it only appears once; the red dot persists until the profile
-- has the essentials (first name, last name, position).
--
-- RLS: the existing `profiles_update_self` policy already lets a user update
-- their own row (without changing their role), which covers these columns —
-- no policy changes needed.

alter table public.profiles
  add column first_name  text,
  add column last_name   text,
  add column position    text,
  add column birthdate   date,
  add column phone       text,
  add column telegram    text,
  add column welcomed_at timestamptz;
