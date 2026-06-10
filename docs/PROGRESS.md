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

## Done (FIRST PASS — client state, NOT persisted)

**Credentials page** (`/credentials`, `src/components/credentials/*`). Resets on
reload — there is **no backend for it yet**.

- Grouping: logins grouped by service; a service with ≥2 logins becomes its own
  section, singles go to "All logins".
- Search (+ clear), service notes (category) and per-item notes (yellow, with ⓘ).
- Service name is the link to the site (↗ on hover); click-to-copy username/
  password (`CopyText`); admin edit (pencil) + remove (trash) on hover.
- Admin add/edit via a centered `CredentialModal` (`Modal`): service (datalist
  for grouping), account label, username, password, URL → favicon auto
  (`ServiceAvatar` + `faviconFor`, Google s2 favicons) with "use a letter"
  fallback; notes behind "+ Add a note".
  - Sandbox note: the favicon host is blocked here, so screenshots show the
    letter fallback; it loads real icons in a normal environment.

## Not built yet / next steps

1. **Credentials backend (next milestone).** Tables for `services` (name, url,
   icon, category note) + `credentials` (service_id, account, username, password,
   per-item note) — passwords as plain text per `CLAUDE.md` (encryption
   intentionally deferred). RLS. Server actions for add/edit/remove. Replace the
   client-state sample data in `credentials-view.tsx` + point the dashboard card
   at live data.
2. **Audit logging** (`audit_logs`) — write on create/update/delete and on
   credential reveal/copy. Never log secret values (`CLAUDE.md`).
3. Other features: Members, Resources, Templates, Events, Links (currently
   `SectionPlaceholder`).
4. **Google Sheets sync** (sheet is source of truth) — later.
5. Figma component library port is partial (done opportunistically per screen).

## Gotchas / conventions

- TS strict, no `any` without justification. Keep `src/lib/db/database.types.ts`
  in sync with migrations (or regenerate via `supabase gen types`).
- Service-role key / Google SA creds are server-only — never client-reachable.
- Confirm the exact corporate email domain before go-live (defaults to
  `webfolks.io` in the hook + `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS`).
- The brand assets `public/webfolks.svg` and `public/creds.svg` were provided by
  the user; emoji PNGs are Apple's (sourced from `emoji-datasource-apple`).
