import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentProfile } from "@/lib/auth/profile";
import { isProfileComplete, type Profile } from "@/lib/db/types";
import { isSlackConfigured } from "@/lib/slack/client";
import { AvatarUpload } from "@/components/profile/avatar-upload";
import { ImportFromSlack } from "@/components/profile/import-from-slack";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = {
  title: "My profile",
};

function displayName(profile: Profile): string {
  const base =
    profile.full_name?.trim() || profile.email.split("@")[0] || profile.email;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

const cardClass =
  "rounded-xl border border-white/[0.06] bg-background p-6";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const complete = isProfileComplete(profile);
  const name = displayName(profile);
  const slackEnabled = isSlackConfigured();

  return (
    <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* Left: identity + photo */}
      <aside className={`${cardClass} flex flex-col items-center gap-5 text-center lg:h-fit`}>
        <AvatarUpload userId={profile.id} name={name} src={profile.avatar_url} />

        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight">
            {name}
          </h2>
          <p className="truncate text-sm text-muted-foreground">
            {profile.email}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
            {profile.role}
          </span>
          {profile.position ? (
            <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {profile.position}
            </span>
          ) : null}
        </div>

        {!complete ? (
          <p className="flex items-center gap-1.5 text-xs text-accent-yellow">
            <span className="size-1.5 rounded-full bg-accent-yellow" aria-hidden />
            Complete your profile
          </p>
        ) : null}
      </aside>

      {/* Right: editable details */}
      <div className={`${cardClass} flex flex-col gap-5`}>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold tracking-tight">
            Your details
          </h3>
          <p className="text-sm text-muted-foreground">
            {complete
              ? "Keep your details up to date so the team can reach you."
              : "Tell the team a bit about yourself — this shows up in the member directory."}
          </p>
        </div>

        {slackEnabled ? <ImportFromSlack /> : null}

        <ProfileForm profile={profile} />
      </div>
    </section>
  );
}
