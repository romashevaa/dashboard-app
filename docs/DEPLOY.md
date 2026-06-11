# Deploying for team testing

Goal: get the dashboard on a real URL so the team can sign in with their
`@webfolks.io` emails. Stack per `CLAUDE.md`: **Vercel** (app) + **Supabase
Cloud** (database/auth). Both have free tiers that comfortably cover an
internal test.

## 1. Supabase Cloud project

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
   (pick a strong DB password; region close to the team).
2. Link the repo to it and push all migrations:

   ```bash
   pnpm supabase login
   pnpm supabase link --project-ref <your-project-ref>
   pnpm db:push          # applies everything in supabase/migrations
   ```

   The project ref is in the dashboard URL: `supabase.com/dashboard/project/<ref>`.

   > `supabase/seed.sql` is **local-only** (runs on `db reset`); production
   > starts empty, which is what we want — enter real data in the app.

3. **Enable the domain allow-list hook** (config.toml only configures local):
   Dashboard → **Authentication → Hooks** → *Before User Created* →
   enable → type **Postgres function** → schema `public`, function
   `before_user_created`. Without this, any email domain could sign up.

4. **Auth URL configuration** (Authentication → URL Configuration):
   - **Site URL**: your production URL (e.g. `https://webfolks-dashboard.vercel.app`) —
     fill in after step 2 below if you don't know it yet.
   - **Redirect URLs**: add `https://<your-domain>/auth/callback`.

5. **Email note**: Supabase's built-in sender is heavily rate-limited
   (a few emails per hour) — fine for 2–3 testers, painful beyond that.
   For the whole team either configure custom SMTP
   (Authentication → Emails → SMTP settings; e.g. Resend/Postmark), or tell
   people to prefer the 6-digit **code** flow and not spam "resend".

## 2. Vercel

1. Push the branch to GitHub and merge to the repo's default branch
   (Vercel deploys the default branch to production; other branches become
   preview deployments).
2. [vercel.com/new](https://vercel.com/new) → import the GitHub repo.
   Framework preset: **Next.js** (auto-detected, pnpm just works).
3. Set the environment variables (Project → Settings → Environment Variables):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page → `anon` `public` key |
   | `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` | `webfolks.io` |

4. Deploy. Copy the production URL back into Supabase's Site URL + Redirect
   URLs (step 1.4).

## 3. First admin + inviting the team

1. Open the production URL, sign in with your `@webfolks.io` email
   (magic link or code).
2. Promote yourself once, in Supabase → SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@webfolks.io';
   ```

3. Refresh — the **Admin** nav item appears. From here on, roles are managed
   in the app (`/admin`).
4. Share the URL with the team. Anyone with an `@webfolks.io` address can
   sign in (the hook rejects all other domains); new users land as `member`.

## Security recap for the test stage

- Sign-in restricted to `webfolks.io` (Postgres auth hook = authoritative;
  the login form mirrors it for UX).
- All routes auth-gated; data access enforced by RLS (reads for any signed-in
  user, writes admin-only).
- Credentials are stored as plain text **by decision** (`CLAUDE.md`) — don't
  put anything in during testing you wouldn't put in the current Google Doc.
- Audit log records create/update/delete/reorder and password reveals
  (identifiers only, never values).

## Updating the deployment

Merge/push to the default branch → Vercel auto-deploys. For new migrations:
`pnpm db:push` against the linked project, then redeploy (or just let the
next push do it).
