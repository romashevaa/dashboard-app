# Running the dashboard locally

A step-by-step guide to get the app running on your own machine, including
magic-link sign-in and promoting your first admin.

## Prerequisites

- **Node.js 20+** and **pnpm** (`npm i -g pnpm`)
- **Docker** running (Docker Desktop, OrbStack, etc.) — the local Supabase
  stack runs in containers.

## 1. Install dependencies

```bash
pnpm install
```

## 2. Start the local Supabase stack

```bash
pnpm db:start          # = supabase start (first run downloads Docker images)
```

When it finishes it prints a block of local URLs and keys. Note these:

| Value           | Example                     | Used for                         |
| --------------- | --------------------------- | -------------------------------- |
| **API URL**     | `http://127.0.0.1:54321`    | `NEXT_PUBLIC_SUPABASE_URL`       |
| **anon key**    | `eyJhbGciOi...` (long JWT)  | `NEXT_PUBLIC_SUPABASE_ANON_KEY`  |
| **Studio URL**  | `http://127.0.0.1:54323`    | DB UI / SQL editor               |
| **Inbucket URL**| `http://127.0.0.1:54324`    | catches all outgoing emails      |

Migrations in `supabase/migrations/` (the domain allow-list hook + profiles &
roles) are applied automatically on start. If you ever need to reapply them
from scratch: `pnpm supabase db reset`.

## 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with the values printed in step 2:

```bash
NEXT_PUBLIC_SUPABASE_URL="http://127.0.0.1:54321"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<the anon key from step 2>"
NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS="webfolks.io"
```

> The allow-list defaults to `webfolks.io`. Sign-in is restricted to this
> domain, so use a `@webfolks.io` address below (the local mailbox catches it
> regardless of whether the address really exists).

## 4. Run the app

```bash
pnpm dev
```

Open <http://localhost:3000>. You'll be redirected to `/login`.

## 5. Sign in with a magic link

1. Enter a `@webfolks.io` email (e.g. `you@webfolks.io`) and submit.
2. Open the local mailbox at <http://127.0.0.1:54324> — the sign-in email
   appears there (nothing is sent to a real inbox locally).
3. Click the link in that email → you're signed in and land on the dashboard.

## 6. Make yourself an admin

New users are created as `member`, so the **Admin** section is hidden at
first. Promote your account once, via Studio's SQL editor
(<http://127.0.0.1:54323>) or any psql client:

```sql
update public.profiles set role = 'admin' where email = 'you@webfolks.io';
```

Refresh the app — the **Admin** nav item appears, and you can manage roles for
everyone else from there.

## Stopping / resetting

```bash
pnpm supabase stop        # stop the local stack (keeps data)
pnpm supabase db reset    # wipe + reapply migrations (fresh DB)
```

## Useful scripts

| Command          | Description                     |
| ---------------- | ------------------------------ |
| `pnpm dev`       | Start the dev server           |
| `pnpm build`     | Production build               |
| `pnpm lint`      | ESLint                         |
| `pnpm typecheck` | TypeScript (no emit)           |
| `pnpm db:start`  | Start the local Supabase stack |
| `pnpm db:push`   | Push migrations to a project   |

---

### Alternative: a hosted Supabase project

Prefer the cloud instead of Docker? Create a project at
[supabase.com](https://supabase.com), then:

1. `pnpm supabase link --project-ref <your-ref>`
2. `pnpm db:push` to apply the migrations.
3. In the dashboard, enable the **before-user-created** auth hook to point at
   `public.before_user_created`, and add `http://localhost:3000/auth/callback`
   to the allowed redirect URLs.
4. Put the project's URL + anon key (Project Settings → API) in `.env.local`
   and run `pnpm dev`.
