# Progress & handoff

Snapshot of where the build is, so a new session can resume quickly. Pairs with
`CLAUDE.md` (locked decisions) and `docs/ARCHITECTURE.md`.

Branch: `claude/youthful-gates-wJoM7`. All work is committed and pushed.

## Stack (in place)

Next.js 16 (App Router, RSC) · TypeScript strict · Tailwind v4 · shadcn-style
components (built by hand — the registry is network-blocked) · Inter font ·
Supabase via `@supabase/ssr` (typed `Database` generic) · dark Figma theme.

Run it: see `docs/RUNNING.md` (`pnpm db:start` needs Docker; then copy
`.env.example` → `.env.local`, `pnpm dev`). Checks: `pnpm typecheck`, `pnpm lint`,
`pnpm build` — all green.

## Done (real)

- **Auth** — passwordless magic link **and** 6-digit code (`src/app/login`,
  `/auth/callback`, `/auth/signout`). Corporate-domain allow-list enforced by a
  Postgres `before_user_created` hook (`supabase/migrations`, wired in
  `config.toml`) + mirrored app-side. Routes gated by `src/proxy.ts` (RLS is the
  real guard). Login form works without client JS (progressive enhancement).
  - Note: magic-link `emailRedirectTo` is the bare `/auth/callback` (a query
    string there breaks Supabase's allowed-redirect match). Deep-link only on the
    code path.
- **RBAC** — `profiles` table (1:1 `auth.users`), `app_role` enum
  (admin/editor/member), auto-created on signup; RLS policies; `current_app_role()`
  helper. Admin UI at `/admin` (list users, assign roles, self-demotion guard).
- **App shell** — flush sidebar (emoji-image nav via `EmojiIcon` + Apple emoji in
  `public/emoji`), surface content panel, header with route-aware `PageTitle`
  (greeting on dashboard, section title elsewhere) + avatar + sign-out. Mobile
  drawer (JS, `MobileNav`). Responsive (1 / 2 / 3 cols). Fits the viewport.
- **Dashboard** (`/`) — Figma 3×4 grid; cards via shared `CardHeading`
  (icon+title+subtitle). Credentials + Templates are real links; the Credentials
  card shows `public/creds.svg`. Other cards are **headings only** (content per
  feature). Visuals hidden below lg.
- **Login** — darker (surface) bg, WebFolks logo (`public/webfolks.svg`, inlined
  in `WebfolksLogo`).
- **Credentials** (`/credentials`) — now backed by Postgres (see below).

## Credentials (real backend)

Migration `supabase/migrations/20260611120000_credentials_services_audit.sql`:

- **`services`** (name, url, icon_url, no_icon, category_note) — one row per
  tool/site; unique on `lower(name)`. **`credentials`** (service_id, account,
  username, password, note) — password is **plain text by design** (`CLAUDE.md`;
  encryption deferred). **`audit_logs`** (actor, action, entity, metadata).
- **RLS:** read = any authenticated user (open visibility, matches the Doc);
  write = **admins only**. Audit logs are admin-readable. Inserts to audit_logs
  go through `record_audit_event()` (SECURITY DEFINER — forces actor =
  `auth.uid()`, so it can't be spoofed and needs no broad INSERT grant).
- **Server actions** (`src/lib/credentials/actions.ts`): `createCredential`,
  `updateCredential`, `deleteCredential` (admin-gated via `requireAdmin`,
  `revalidatePath('/credentials')`), `logCredentialReveal` (any signed-in user,
  on password copy). Each writes an audit event with **identifiers only —
  never the username/password values** (update logs changed field *names*).
  Editing/deleting a service's last login prunes the orphan service.
- **Data:** `src/lib/credentials/data.ts` `getCredentials()` joins
  credentials→services for the page; `credentials-view.tsx` is now driven by
  server data (props), not client sample state.
- **Sample data:** `supabase/seed.sql` (Webflow group, UI8, Adobe w/ note, Loom,
  Freepik) — runs on `supabase db reset`, NOT on `db push`, so prod stays empty.
- Sandbox note: the favicon host (Google s2) is blocked here, so screenshots show
  the letter fallback; real icons load in a normal environment.

## Not built yet / next steps

1. **Admin audit-log viewer** — `audit_logs` is populated; no UI reads it yet
   (admins can query it directly). A simple `/admin/audit` table is the natural
   next step.
2. Other features: Members, Resources, Templates, Events, Links (currently
   `SectionPlaceholder` with per-feature empty states).
3. **Google Sheets sync** (sheet is source of truth) — later.
4. Figma component library port is partial (done opportunistically per screen).
5. **Note:** credential writes are admin-only; if `editor` should manage them
   too, widen the RLS write policies + the `isAdmin` gate on the page.

## Gotchas / conventions

- TS strict, no `any` without justification. Keep `src/lib/db/database.types.ts`
  in sync with migrations (or regenerate via `supabase gen types`).
- Service-role key / Google SA creds are server-only — never client-reachable.
- Confirm the exact corporate email domain before go-live (defaults to
  `webfolks.io` in the hook + `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`).
- The brand assets `public/webfolks.svg` and `public/creds.svg` were provided by
  the user; emoji PNGs are Apple's (sourced from `emoji-datasource-apple`).
