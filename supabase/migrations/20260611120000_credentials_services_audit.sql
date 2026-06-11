-- Credentials feature: services + credentials tables, audit logging, and RLS.
-- (CLAUDE.md → Credentials, Audit logging, Roles & access.)
--
-- Decisions locked in CLAUDE.md and intentionally NOT changed here:
--   * Passwords are stored as PLAIN TEXT, mirroring the current Google Doc.
--     Encryption is deferred — do not add a Vault/crypto layer unless asked.
--   * Credential values (and any secret) must NEVER be written to audit_logs.
--   * RLS is the PRIMARY access gate. Visibility is open to every signed-in
--     user (matches the Doc); writes are admin-only for now.

-- ---------------------------------------------------------------------------
-- services — one row per tool/site. Carries the display name, link, icon, and
-- the optional "category note" shown under a grouped service's heading.
-- ---------------------------------------------------------------------------
create table public.services (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  url           text,
  icon_url      text,
  no_icon       boolean not null default false,
  category_note text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

comment on table public.services is
  'A tool/site that team credentials belong to (Credentials feature).';

-- One service per name (case-insensitive) so logins group cleanly.
create unique index services_name_key on public.services (lower(name));

alter table public.services enable row level security;

create trigger services_set_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- credentials — a single login under a service.
-- password is PLAIN TEXT by design (see header / CLAUDE.md).
-- ---------------------------------------------------------------------------
create table public.credentials (
  id         uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  account    text,
  username   text not null,
  password   text not null,
  note       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.credentials is
  'A login (username/password) under a service. Password is plain text by design; keep it out of logs.';

create index credentials_service_id_idx on public.credentials (service_id);

alter table public.credentials enable row level security;

create trigger credentials_set_updated_at
  before update on public.credentials
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- audit_logs — actor / action / entity / timestamp / minimal metadata.
-- NEVER store credential values or any secret here (CLAUDE.md).
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users (id) on delete set null,
  actor_email text,
  action      text not null,             -- create | update | delete | reveal
  entity_type text not null,             -- e.g. 'credential'
  entity_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,  -- minimal diff; no secrets
  created_at  timestamptz not null default now()
);

comment on table public.audit_logs is
  'Append-only audit trail. Metadata is a minimal diff — never credential values or secrets.';

create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

-- Records an audit event with the actor forced to the caller (so it can't be
-- spoofed). SECURITY DEFINER lets gated server actions write without granting a
-- broad INSERT on the table. Callers must pass non-secret metadata only.
create or replace function public.record_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_logs (
    actor_id, actor_email, action, entity_type, entity_id, metadata
  )
  values (
    auth.uid(),
    (select email from public.profiles where id = auth.uid()),
    p_action,
    p_entity_type,
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Row-Level Security
--   read  : any authenticated user (open visibility, matches the Doc)
--   write : admins only (mirrored in the UI for UX; RLS is the real gate)
-- ---------------------------------------------------------------------------
create policy "services_select_authenticated"
  on public.services for select to authenticated using (true);
create policy "services_write_admin"
  on public.services for all to authenticated
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

create policy "credentials_select_authenticated"
  on public.credentials for select to authenticated using (true);
create policy "credentials_write_admin"
  on public.credentials for all to authenticated
  using (public.current_app_role() = 'admin')
  with check (public.current_app_role() = 'admin');

-- Audit logs are admin-readable only; inserts go through record_audit_event.
create policy "audit_logs_select_admin"
  on public.audit_logs for select to authenticated
  using (public.current_app_role() = 'admin');

-- Privileges (RLS still applies on top).
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.credentials to authenticated;
grant select on public.audit_logs to authenticated;
grant execute on function public.record_audit_event(text, text, uuid, jsonb)
  to authenticated;
