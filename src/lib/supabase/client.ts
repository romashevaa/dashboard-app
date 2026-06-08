import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/lib/db/database.types";

/**
 * Supabase client for use in Client Components (runs in the browser).
 * Only the anon key is exposed here — never the service-role key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
