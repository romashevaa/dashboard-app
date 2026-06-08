-- Corporate email-domain allow-list for auth.
--
-- This is the AUTHORITATIVE gate (CLAUDE.md → Auth): no user can be created
-- with a non-allowed email address. The app-layer check on the login screen
-- mirrors this for fast UX feedback only.
--
-- Implemented as a Supabase `before-user-created` auth hook. The hook is wired
-- up in supabase/config.toml ([auth.hook.before_user_created]).

-- Allowed corporate domains. Adjust this list to match the company's verified
-- email domain(s) before going live.
create or replace function public.allowed_email_domains()
returns text[]
language sql
immutable
as $$
  select array['webfolks.io']::text[];
$$;

-- Auth hook: receives the pending user as `event`, raises to reject.
create or replace function public.before_user_created(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_email text;
  user_domain text;
begin
  user_email := lower(event -> 'claims' ->> 'email');

  -- No email on the event (e.g. non-email providers) — nothing to gate here.
  if user_email is null or user_email = '' then
    return event;
  end if;

  user_domain := split_part(user_email, '@', 2);

  if not (user_domain = any (public.allowed_email_domains())) then
    raise exception 'Email domain % is not permitted to sign up.', user_domain
      using errcode = 'check_violation';
  end if;

  return event;
end;
$$;

-- The auth admin role invokes hooks; grant it execution.
grant execute on function public.before_user_created(jsonb) to supabase_auth_admin;
grant execute on function public.allowed_email_domains() to supabase_auth_admin;

revoke execute on function public.before_user_created(jsonb) from authenticated, anon, public;
