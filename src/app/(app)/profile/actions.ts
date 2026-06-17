"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { lookupSlackUserByEmail } from "@/lib/slack/client";

export type ProfileFormState = { ok?: boolean; error?: string };
export type ImportState = { ok?: boolean; error?: string };

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
  const hireDate = clean(formData.get("hire_date"));
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
      hire_date: hireDate,
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
 * Pre-fills the user's profile from their Slack account (matched by email).
 * Maps name, title→position, phone and avatar; only overwrites a field when
 * Slack actually has a value, so it won't wipe details the user already set.
 */
export async function importFromSlack(
  _prev: ImportState,
  _formData: FormData
): Promise<ImportState> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const result = await lookupSlackUserByEmail(profile.email);
  if (!result.ok) {
    const message =
      result.error === "users_not_found"
        ? "No Slack account found for your email."
        : result.error === "not_configured"
          ? "Slack import isn't configured yet."
          : "Couldn't reach Slack. Please try again.";
    return { error: message };
  }

  const sp = result.profile;
  const realParts = (sp.real_name ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName =
    sp.first_name?.trim() || realParts[0] || profile.first_name;
  const lastName =
    sp.last_name?.trim() || realParts.slice(1).join(" ") || profile.last_name;
  const position = sp.title?.trim() || profile.position;
  const phone = sp.phone?.trim() || profile.phone;
  const avatarUrl = sp.image_512 || sp.image_192 || profile.avatar_url;
  const fullName =
    [firstName, lastName].filter(Boolean).join(" ") || profile.full_name;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      position,
      phone,
      avatar_url: avatarUrl,
      full_name: fullName,
      welcomed_at: profile.welcomed_at ?? new Date().toISOString(),
    })
    .eq("id", profile.id);

  if (error) {
    console.error("[profile] slack import save failed:", error.message);
    return { error: "Couldn't save the imported details. Please try again." };
  }

  revalidatePath("/", "layout");
  return { ok: true };
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
