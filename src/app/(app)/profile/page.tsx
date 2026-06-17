import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/profile";
import { isProfileComplete } from "@/lib/db/types";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "My profile",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const complete = isProfileComplete(profile);

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold tracking-tight">Your details</h2>
        <p className="text-sm text-muted-foreground">
          {complete
            ? "Keep your details up to date so the team can reach you."
            : "Tell the team a bit about yourself — this shows up in the member directory."}
        </p>
      </div>

      <ProfileForm profile={profile} />
    </section>
  );
}
