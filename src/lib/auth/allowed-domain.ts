/**
 * Corporate email-domain allow-list.
 *
 * Auth is restricted to company addresses (CLAUDE.md → Auth). The
 * authoritative gate is the Postgres `before-user-created` auth hook
 * (see supabase/migrations) so a user can never be created with a
 * non-allowed address. This module mirrors that check at the app layer
 * for fast UX feedback on the login screen — it is NOT the sole guard.
 *
 * Configure via NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS (comma-separated). The
 * default below matches the corporate domain inferred from the team's
 * addresses; confirm/adjust before going live.
 */
const DEFAULT_ALLOWED_DOMAINS = ["webfolks.io"];

export function getAllowedDomains(): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS;
  const domains = (fromEnv ? fromEnv.split(",") : DEFAULT_ALLOWED_DOMAINS)
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  return domains.length > 0 ? domains : DEFAULT_ALLOWED_DOMAINS;
}

export function isAllowedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at === -1) return false;
  const domain = normalized.slice(at + 1);
  return getAllowedDomains().includes(domain);
}
