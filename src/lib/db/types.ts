/**
 * Hand-written types for the app data model. Once a live Supabase project is
 * connected, these can be replaced by generated types
 * (`supabase gen types typescript`).
 */

export type AppRole = "admin" | "editor" | "member";

export const APP_ROLES: AppRole[] = ["admin", "editor", "member"];

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
  updated_at: string;
};
