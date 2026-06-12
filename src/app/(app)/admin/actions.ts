"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { APP_ROLES, type AppRole } from "@/lib/db/types";

export type UpdateRoleState = { error?: string; ok?: boolean };
export type RemoveUserState = { error?: string; ok?: boolean };

/**
 * Assigns a role to a user. RLS (`profiles_update_admin`) is the authoritative
 * gate; requireAdmin() here mirrors it for a clean redirect/UX.
 */
export async function updateUserRole(
  _prevState: UpdateRoleState,
  formData: FormData
): Promise<UpdateRoleState> {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as AppRole;

  if (!userId || !APP_ROLES.includes(role)) {
    return { error: "Invalid request." };
  }

  // Guard against an admin accidentally demoting themselves and locking the
  // team out of admin access.
  if (userId === admin.id && role !== "admin") {
    return { error: "You can't change your own admin role." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    return { error: "Couldn't update the role. Try again." };
  }

  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Permanently removes a user — deletes the auth.users row, which cascades to
 * their profile (and credentials they own stay; those belong to services, not
 * users). Requires the service-role key, since deleting an auth user is beyond
 * what RLS/anon can do. Admin-gated; you can't remove yourself.
 */
export async function removeUser(userId: string): Promise<RemoveUserState> {
  const admin = await requireAdmin();

  if (!userId) return { error: "Invalid request." };
  if (userId === admin.id) {
    return { error: "You can't remove your own account." };
  }

  // Capture identity for the audit log before the row is gone.
  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("id", userId)
    .single();

  let adminClient: ReturnType<typeof createAdminClient>;
  try {
    adminClient = createAdminClient();
  } catch {
    return {
      error:
        "User removal isn't configured on the server (missing service-role key).",
    };
  }

  const { error } = await adminClient.auth.admin.deleteUser(userId);
  if (error) {
    console.error("[admin] deleteUser failed:", error.message);
    return { error: "Couldn't remove the user. Try again." };
  }

  // Audit with identifiers only (actor = current admin, set by the function).
  await supabase.rpc("record_audit_event", {
    p_action: "delete",
    p_entity_type: "user",
    p_entity_id: userId,
    p_metadata: { email: target?.email ?? null, role: target?.role ?? null },
  });

  revalidatePath("/admin");
  return { ok: true };
}
