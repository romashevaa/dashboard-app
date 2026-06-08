import type { Database } from "./database.types";

/**
 * App-facing aliases derived from the generated database schema, so the rest
 * of the app imports stable names rather than deep index types.
 */

export type AppRole = Database["public"]["Enums"]["app_role"];

export const APP_ROLES: AppRole[] = ["admin", "editor", "member"];

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
