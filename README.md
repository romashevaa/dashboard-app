# Webfolks Dashboard

Internal team hub for the Webfolks agency — member directory, shared tool
credentials, a resources/learning library, templates, an events & holidays
calendar, and doc/brand/social links. See [`CLAUDE.md`](./CLAUDE.md) and
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full context and locked
decisions.

## Stack

- **Next.js** (App Router) + **TypeScript** (strict), React Server Components by
  default.
- **Tailwind CSS v4** + **shadcn/ui** primitives.
- **Supabase** — Postgres, Auth (passwordless magic link), Row-Level Security.
- Hosting: Vercel (app) + Supabase Cloud.

## Getting started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase URL and anon key. For local development you can run the
Supabase stack and use the printed values:

```bash
pnpm db:start   # supabase start — prints local URL + anon key
pnpm db:push    # apply migrations (incl. the domain allow-list auth hook)
```

### 3. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). All routes are auth-gated —
you'll be redirected to `/login`.

## Auth

- **Passwordless magic link** (Supabase email auth). No passwords, no SSO.
- Restricted to the **corporate email domain** via:
  - the authoritative Postgres `before_user_created` auth hook
    (`supabase/migrations/*_auth_domain_allowlist.sql`, wired up in
    `supabase/config.toml`), and
  - a mirrored app-layer check on the login screen for fast UX feedback
    (`src/lib/auth/allowed-domain.ts`).
- Configure the allowed domain(s) via `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` and
  `public.allowed_email_domains()` in the migration. **Default is `webfolks.io`
  — confirm the exact domain before going live.**

All routes are gated by `src/proxy.ts` (Next.js 16 proxy convention), which
refreshes the Supabase session and redirects unauthenticated users to `/login`.
RLS remains the primary access guard; the proxy is for UX only.

## Project structure

```
src/
  app/
    (app)/              # authenticated app shell (header + nav) and sections
      layout.tsx        # server-side auth gate + shell
      page.tsx          # overview
      members/ …        # feature sections (scaffolded placeholders)
    auth/
      callback/route.ts # magic-link landing → exchanges code for a session
      signout/route.ts
    login/              # login screen + magic-link server action
  components/
    ui/                 # shadcn-based primitives (Button …)
    layout/             # AppHeader, MainNav
  lib/
    supabase/           # browser, server, and proxy Supabase clients
    auth/               # domain allow-list
    nav.ts              # primary navigation config
  proxy.ts              # auth gate / session refresh
supabase/
  config.toml           # local stack + auth hook config
  migrations/           # SQL migrations
```

## Scripts

| Command          | Description                     |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Start the dev server           |
| `pnpm build`     | Production build               |
| `pnpm lint`      | ESLint                         |
| `pnpm typecheck` | TypeScript (no emit)           |
| `pnpm db:start`  | Start the local Supabase stack |
| `pnpm db:push`   | Apply migrations               |
