"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";

export type ProfileFormState = { ok?: boolean; error?: string };

function clean(value: FormDataEntryValue | null): string | null {
  const trimmed = String(value ?? "").trim();
  return trimmed.length ? trimmed : null;
}

/**
 * Saves the signed-in user's own profile details. RLS (`profiles_update_self`)
 * is the authoritative gate — a user can only update their own row and can't
 * change their role.
 */
export async function updateMyProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const firstName = clean(formData.get("first_name"));
  const lastName = clean(formData.get("last_name"));
  const position = clean(formData.get("position"));
  const birthdate = clean(formData.get("birthdate"));
  const phone = clean(formData.get("phone"));
  const telegram = clean(formData.get("telegram"));

  if (!firstName || !lastName) {
    return { error: "First and last name are required." };
  }

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      position,
      birthdate,
      phone,
      telegram,
      full_name: fullName,
      // Saving counts as having seen the welcome.
      welcomed_at: profile.welcomed_at ?? new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    console.error("[profile] update failed:", error.message);
    return { error: "Couldn't save your profile. Please try again." };
  }

  // The header avatar (name, red dot) lives in the shared layout.
  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Marks the welcome as seen so the onboarding modal doesn't show again. The
 * red-dot nudge stays until the profile is actually complete.
 */
export async function dismissWelcome(): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile || profile.welcomed_at) return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ welcomed_at: new Date().toISOString() })
    .eq("id", profile.id);

  revalidatePath("/", "layout");
}

/**
 * Records the user's avatar URL (the file is uploaded to storage client-side,
 * which keeps large images off the server-action body). Pass null to remove.
 */
export async function setAvatar(url: string | null): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ avatar_url: url })
    .eq("id", profile.id);

  revalidatePath("/", "layout");
}
