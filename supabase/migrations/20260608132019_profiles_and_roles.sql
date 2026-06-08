-- Profiles + RBAC (CLAUDE.md → Roles & access).
--
-- `profiles` is 1:1 with auth.users and carries the user's role. RLS is the
-- PRIMARY access gate; the app mirrors these checks for UX only.
--
-- Minimal first cut: roles admin/editor/member, new users default to member,
-- and the first admin is promoted by hand (see the note at the bottom).

-- Role tiers.
create type public.app_role as enum ('admin', 'editor', 'member');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  full_name  text,
  role       public.app_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Application profile (1:1 with auth.users); carries the user role.';

alter table public.profiles enable row level security;

-- Keep updated_at fresh on every write.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role of the currently authenticated user. SECURITY DEFINER so policies can
-- call it without recursing through profiles' own RLS.
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------

-- Any signed-in user can read profiles (internal team directory).
create policy "profiles_select_authenticated"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Users can update their own profile, but NOT change their own role
-- (the role must stay equal to its current value).
create policy "profiles_update_self"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_app_role());

-- Admins can update any profile, including assigning roles.
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

-- Privileges (RLS still applies on top). Inserts happen only via the
-- SECURITY DEFINER trigger, so authenticated users get no insert grant.
grant select, update on public.profiles to authenticated;
grant execute on function public.current_app_role() to authenticated;

-- ---------------------------------------------------------------------------
-- Bootstrap the first admin (run once, by hand, after the user has signed in):
--
--   update public.profiles set role = 'admin' where email = 'you@webfolks.io';
--
-- After that, admins manage roles through the in-app admin UI.
-- ---------------------------------------------------------------------------
