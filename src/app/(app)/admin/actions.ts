"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { APP_ROLES, type AppRole } from "@/lib/db/types";

export type UpdateRoleState = { error?: string; ok?: boolean };

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
