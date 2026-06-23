import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/db/types";

/**
 * Cookie that lets a real admin preview the app as a normal member would see
 * it (admin-only controls hidden). UI affordance only — the user's real role
 * is unchanged and RLS remains the authoritative gate on the data.
 */
export const ADMIN_PREVIEW_COOKIE = "admin_preview";

/**
 * Returns the current user's profile (role, etc.), or null if not signed in.
 * RLS guarantees a user can only read profiles it's permitted to.
 *
 * Wrapped in React `cache()` so multiple callers in one request (the app
 * layout + `requireAdmin` on admin pages) share a single execution instead of
 * each re-running the auth check and profile query.
 *
 * Uses `getClaims()` (local JWT verification with asymmetric signing keys — no
 * Auth-server round-trip) rather than `getUser()` to read the user id.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: claims,
  } = await supabase.auth.getClaims();

  const userId = claims?.claims?.sub;
  if (!userId) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return (data as Profile | null) ?? null;
});

export type ViewerContext = {
  profile: Profile | null;
  /** The user's actual role is admin. */
  isRealAdmin: boolean;
  /** A real admin who has toggled the member-preview on. */
  previewingAsMember: boolean;
  /** Effective admin flag for the UI: real admin AND not previewing as member. */
  isAdmin: boolean;
};

/**
 * Resolves the viewer's profile plus the *effective* admin flag, honoring the
 * admin "view as member" preview cookie. Use this anywhere the UI gates on
 * admin so the preview flips the whole tree consistently.
 */
export async function getViewerContext(): Promise<ViewerContext> {
  const profile = await getCurrentProfile();
  const isRealAdmin = profile?.role === "admin";

  const cookieStore = await cookies();
  const previewingAsMember =
    isRealAdmin &&
    cookieStore.get(ADMIN_PREVIEW_COOKIE)?.value === "member";

  return {
    profile,
    isRealAdmin,
    previewingAsMember,
    isAdmin: isRealAdmin && !previewingAsMember,
  };
}

/**
 * Guards admin-only server routes. Redirects non-admins. Note this mirrors the
 * RLS policy for UX — RLS remains the authoritative gate on the data itself.
 * Uses the real role (not the preview) so an admin can't lock themselves out.
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/");
  return profile;
}
