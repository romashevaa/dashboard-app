# Webfolks Dashboard — Architecture Brief

A short reference for the decisions behind the build. Lives in the repo (e.g. `docs/`); the operational detail for Claude Code is in `CLAUDE.md`.

## What we're building

An internal hub for the Webfolks team to access shared resources, tool credentials, the member directory, templates, and an events/holidays calendar in one place — replacing the scattered Google Docs/Sheets the team uses today. Auth-gated, admin-managed, built feature by feature.

## Locked decisions

1. **Stack** — Next.js + TypeScript + Tailwind + shadcn/ui on the front, Supabase (Postgres / Auth / RLS / Edge Functions) on the back, Vercel hosting. One backend service covers auth, relational data, role enforcement, and scheduled sync; the front end maps cleanly onto the Figma component library.
2. **Auth** — passwordless magic link restricted to the corporate email domain. No passwords to manage; only company addresses get in.
3. **Credentials** — stored as plain values mirroring today's Google Doc. Encryption deferred, values kept out of logs, visibility gateable by role later without rework.
4. **Sheets** — two-way sync with the **sheet as source of truth**: the app mirrors the sheet and the sheet wins on conflict. Keeps the integration simple and loop-free.

## Domain (from the Figma library)

Members · Credentials · Resources · Templates · Events/Holidays · Doc/Brand/Social links.

## Data & sync model (sketch)

- A Postgres table per entity, plus `profiles` (carries role) and `audit_logs`.
- RLS is the access spine: magic-link identity → profile → role → policy.
- Sheets sync: a scheduled Edge Function pulls the sheet as canonical; app edits are best-effort write-through to the sheet.

## Roadmap

Scaffold + auth + protected shell → data model + roles + admin user management → port Figma components → audit logging → first feature → Sheets sync → credentials.

## Open items (deferred on purpose)

- Which entities actually sync with Sheets.
- Final role tiers and per-role permissions.
- The exact corporate domain for the auth allow-list.
- Full assembled screens — the Figma page is currently a component library; we'll pull screen frames as we start each feature.
