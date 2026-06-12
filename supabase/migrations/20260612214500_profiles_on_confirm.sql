-- Only show users in the admin panel AFTER a successful sign-in.
--
-- Problem: a passwordless OTP/magic-link request CREATES the auth user
-- immediately (unconfirmed) — so the old `handle_new_user` insert-trigger added
-- a profile before the person ever actually signed in. Abandoned/test sign-in
-- attempts therefore showed up as "members".
--
-- Fix: create the profile only once the email is confirmed (the first real
-- sign-in), via:
--   * a guarded insert trigger (covers providers that confirm immediately), and
--   * an update trigger that fires when email_confirmed_at first gets set.

-- Gate the existing insert trigger's function on confirmation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null then
    insert into public.profiles (id, email)
    values (new.id, new.email)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

-- Create the profile when an existing user confirms (first OTP/link sign-in).
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    insert into public.profiles (id, email)
    values (new.id, new.email)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update on auth.users
  for each row execute function public.handle_user_confirmed();

-- One-time cleanup: drop profiles for users who never confirmed (test/abandoned
-- sign-ins, e.g. a wrong-domain address typed by mistake).
delete from public.profiles p
using auth.users u
where p.id = u.id
  and u.email_confirmed_at is null;
