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
      services: {
        Row: {
          id: string;
          name: string;
          url: string | null;
          icon_url: string | null;
          no_icon: boolean;
          category_note: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          url?: string | null;
          icon_url?: string | null;
          no_icon?: boolean;
          category_note?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          url?: string | null;
          icon_url?: string | null;
          no_icon?: boolean;
          category_note?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      credentials: {
        Row: {
          id: string;
          service_id: string;
          account: string | null;
          username: string;
          password: string | null;
          note: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          account?: string | null;
          username: string;
          password?: string | null;
          note?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          account?: string | null;
          username?: string;
          password?: string | null;
          note?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "credentials_service_id_fkey";
            columns: ["service_id"];
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          id: string;
          actor_id: string | null;
          actor_email: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          actor_email?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: Database["public"]["Enums"]["app_role"];
          avatar_url: string | null;
          first_name: string | null;
          last_name: string | null;
          position: string | null;
          birthdate: string | null;
          phone: string | null;
          telegram: string | null;
          welcomed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          avatar_url?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          position?: string | null;
          birthdate?: string | null;
          phone?: string | null;
          telegram?: string | null;
          welcomed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          avatar_url?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          position?: string | null;
          birthdate?: string | null;
          phone?: string | null;
          telegram?: string | null;
          welcomed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      record_audit_event: {
        Args: {
          p_action: string;
          p_entity_type: string;
          p_entity_id: string | null;
          p_metadata?: Json;
        };
        Returns: undefined;
      };
    };
    Enums: {
      app_role: "admin" | "editor" | "member";
    };
    CompositeTypes: { [_ in never]: never };
  };
};
