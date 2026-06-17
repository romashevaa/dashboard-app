import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/profile";
import { isProfileComplete, type Profile } from "@/lib/db/types";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "My profile",
};

function displayName(profile: Profile): string {
  const base =
    profile.full_name?.trim() || profile.email.split("@")[0] || profile.email;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const complete = isProfileComplete(profile);
  const name = displayName(profile);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      {/* Identity summary */}
      <div className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-background p-5">
        <span
          aria-hidden
          className="grid size-16 shrink-0 place-items-center rounded-full bg-white/10 text-xl font-semibold text-white"
        >
          {initials(name)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold tracking-tight">
            {name}
          </h2>
          <p className="truncate text-sm text-muted-foreground">
            {profile.email}
          </p>
          <span className="mt-1.5 inline-block rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
            {profile.role}
          </span>
        </div>
      </div>

      {/* Details form */}
      <div className="flex flex-col gap-5 rounded-xl border border-white/[0.06] bg-background p-5 sm:p-6">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold tracking-tight">Your details</h3>
          <p className="text-sm text-muted-foreground">
            {complete
              ? "Keep your details up to date so the team can reach you."
              : "Tell the team a bit about yourself — this shows up in the member directory."}
          </p>
        </div>

        <ProfileForm profile={profile} />
      </div>
    </section>
  );
}
