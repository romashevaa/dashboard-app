# CLAUDE.md

> Operational memory for Claude Code. Read this first on every task.

## Project

**Webfolks Dashboard** — an internal team hub for the Webfolks agency. Single-tenant, internal-use web app, built incrementally feature by feature.

Planned features: team member directory, shared tool credentials, a resources/learning library, templates, an events & holidays calendar, and doc/brand/social links. Cross-cutting: audit logging, admin-managed account levels, and Google Sheets sync.

Design source: Figma `rqVWLYoa1f2D1zzm3fAqeG` (Figma MCP is connected — pull component specs on demand; node IDs in the Figma Reference section).

## Stack

- **Framework:** Next.js (App Router) + TypeScript (strict). React Server Components by default; client components only where interactivity requires.
- **UI:** Tailwind CSS + shadcn/ui. Figma components are ported into shadcn-based primitives.
- **Backend:** Supabase — Postgres, Auth, Row-Level Security, Edge Functions, scheduled jobs (cron).
- **Hosting:** Vercel (app) + Supabase Cloud.
- **Integrations:** Google Sheets API via a service account (two-way sync — see below).

## Auth

- Passwordless **magic link** (Supabase email auth). No passwords, no Google SSO.
- Restricted to the **corporate email domain**: enforce a domain allow-list via a Supabase auth hook (before-user-created) / signup check so only company addresses can request a link. *(Confirm the exact domain before wiring.)*
- All app routes are auth-gated via middleware. No public pages beyond the login screen.

## Roles & access (RBAC) — proposed, confirm before building the admin UI

- Roles: `admin`, `editor`, `member`, stored on a `profiles` row (1:1 with `auth.users`).
- Enforce with Postgres **RLS policies as the primary gate**; mirror checks in middleware/UI for UX only, never as the sole guard.
- Admin can manage users and assign roles via an admin UI.

## Audit logging

- `audit_logs` table: actor, action, entity type, entity id, timestamp, minimal diff/metadata.
- Write on create/update/delete of core entities, and on credential reveals.
- **Never** write credential values (or any secret) into audit logs.

## Credentials (explicit decisions — do not "improve" unprompted)

- Stored as **plain text fields** in Postgres, mirroring the current Google Doc. Encryption is **intentionally deferred** — do NOT add an encryption/Vault layer unless explicitly asked.
- Keep credential values out of audit logs and out of any client/server logging.
- Visibility is currently open to all signed-in users (matches the Doc). The RBAC layer lets us gate visibility by role later without schema rework.

## Google Sheets sync

- Mode: **two-way, but the SHEET IS THE SOURCE OF TRUTH.** The app mirrors the sheet.
- Implication (removes loop/conflict risk): pulls from the sheet are canonical; app → sheet writes are best-effort write-through; on any conflict the **sheet value wins** and overwrites the app.
- Auth: Google **service account**; share the target spreadsheet with the service-account email.
- Mechanism: Supabase Edge Function on a schedule for the canonical pull; optional Apps Script `onEdit` webhook for near-real-time pull. App → sheet writes go through the Sheets API.
- Structure (default): one spreadsheet, one tab per synced entity. **Which entities sync = OPEN**, decide when building the sync.

## Component library (from Figma)

Build these as reusable shadcn-based components before assembling screens:

- **Button** — variants: type (stroke/filled), size (sm/xl), hover.
- **Cards** — Member (detail state), Creds (reveal/hover state), Resource (webflow/loom/book types), Template, Event (holiday flag), Card Minor, Doc Link, Social Card.
- **Layout/nav** — Header, logo, Tabs/Tab, Breadcrumbs, Labels, TableRow, CredRow.

## Conventions

- TypeScript strict; no `any` without a comment justifying it.
- Data access via typed Supabase queries; rely on RLS — do not bypass it with the service-role key in any client-reachable path.
- Server-side secrets only (service-role key, Google SA creds) in env vars / Supabase secrets — never shipped to the client.
- Commands (fill in once scaffolded): `pnpm dev`, `pnpm build`, `supabase db push`, etc.
- Migrations are explicit and reviewed; no destructive migration without confirmation.

## Build sequence (current status: NOT yet scaffolded)

1. Scaffold Next.js + TS + Tailwind + shadcn/ui; init Supabase; magic-link auth + domain allow-list; protected app shell + nav.
2. Data model + `profiles`/roles + admin user management.
3. Port the Figma component library.
4. Audit logging infrastructure.
5. First feature (Members or Resources), then iterate feature by feature.
6. Google Sheets sync (sheet-as-source).
7. Credentials.

## Figma reference

File key: `rqVWLYoa1f2D1zzm3fAqeG`. Key component node IDs:

- Button frame: `438:11561`
- Member: `293:9602` · Creds: `246:4275` · Resource Card: `351:5091` · Templates: `415:10855` · Event: `401:24375`
- Card Minor: `246:5442` · Doc Link: `246:6463` · Social Card: `415:10888`
- Header: `54:988` · Tabs: `401:23247` · Tab: `351:13250` · Breadcrumbs: `331:3380` · TableRow: `60:7908` · CredRow: `89:7548`

Use the Figma MCP (`get_design_context`) to pull exact specs when implementing each component. Note: the Figma "Comp" page is a component library, not assembled screens — pull screen frames when starting each feature.
