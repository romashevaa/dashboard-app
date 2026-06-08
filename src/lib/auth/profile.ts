import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/db/types";

/**
 * Returns the current user's profile (role, etc.), or null if not signed in.
 * RLS guarantees a user can only read profiles it's permitted to.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
}

/**
 * Guards admin-only server routes. Redirects non-admins. Note this mirrors the
 * RLS policy for UX — RLS remains the authoritative gate on the data itself.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/");
  return profile;
}
