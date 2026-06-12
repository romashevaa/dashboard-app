import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/db/database.types";

/**
 * Privileged Supabase client using the service-role key. BYPASSES RLS — use
 * only in trusted, server-side, admin-gated paths (never client-reachable),
 * for tasks the anon client can't do, e.g. deleting an auth user.
 *
 * Throws if the key isn't configured so callers can surface a clear message.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
