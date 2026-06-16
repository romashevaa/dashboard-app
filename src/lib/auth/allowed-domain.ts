/**
 * Corporate email-domain allow-list.
 *
 * Auth is restricted to company addresses (CLAUDE.md → Auth). The
 * authoritative gate is the Postgres `before-user-created` auth hook
 * (see supabase/migrations) so a user can never be created with a
 * non-allowed address. This module mirrors that check at the app layer
 * for fast UX feedback on the login screen — it is NOT the sole guard.
 *
 * The corporate domain is ALWAYS enforced so the gate can never be weakened
 * by a missing/empty env var. NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS (comma-
 * separated) can only ADD extra domains, never remove the corporate one.
 */
const CORPORATE_DOMAINS = ["webfolks.io"];

export function getAllowedDomains(): string[] {
  const fromEnv = (process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  // De-duplicate; the corporate domain is always present.
  return [...new Set([...CORPORATE_DOMAINS, ...fromEnv])];
}

export function isAllowedEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  if (at === -1) return false;
  const domain = normalized.slice(at + 1);
  return getAllowedDomains().includes(domain);
}

