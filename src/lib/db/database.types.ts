/**
 * Typed schema for the Supabase Postgres database, shaped like the output of
 * `supabase gen types typescript`. Passed to the Supabase clients so all
 * `.from(...)` queries are type-checked.
 *
 * When a live project is connected, regenerate this file with:
 *   pnpm supabase gen types typescript --local > src/lib/db/database.types.ts
 *
 * Until then it's maintained by hand alongside the SQL migrations — add a
 * table here whenever you add one in supabase/migrations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: Database["public"]["Enums"]["app_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      app_role: "admin" | "editor" | "member";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
