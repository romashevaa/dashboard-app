import type { Database } from "./database.types";

/**
 * App-facing aliases derived from the generated database schema, so the rest
 * of the app imports stable names rather than deep index types.
 */

export type AppRole = Database["public"]["Enums"]["app_role"];

export const APP_ROLES: AppRole[] = ["admin", "editor", "member"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * A profile is "complete" once the essentials are filled in. Drives the
 * onboarding nudge (welcome modal + red dot on the account button).
 */
export function isProfileComplete(
  profile: Pick<Profile, "first_name" | "last_name" | "position">
): boolean {
  return Boolean(
    profile.first_name?.trim() &&
      profile.last_name?.trim() &&
      profile.position?.trim()
  );
}

