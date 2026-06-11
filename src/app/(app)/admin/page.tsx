import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/db/types";
import { RoleForm } from "./role-form";

export const metadata: Metadata = {
  title: "Admin",
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

const joinedFormat = new Intl.DateTimeFormat("en", {
  month: "short",
  year: "numeric",
});

export default async function AdminPage() {
  const admin = await requireAdmin();

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  const profiles = (data ?? []) as Profile[];

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Team members</h2>
          <p className="text-sm text-muted-foreground">
            Everyone who has signed in. Role changes apply immediately —
            enforced by the database, not just the UI.
          </p>
        </div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-muted-foreground">
          {profiles.length} {profiles.length === 1 ? "member" : "members"}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-background">
        {profiles.map((profile) => {
          const isSelf = profile.id === admin.id;
          const name = displayName(profile);
          return (
            <div
              key={profile.id}
              className="flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4 sm:py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  aria-hidden
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-sm font-semibold text-white"
                >
                  {initials(name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {name}
                    {isSelf ? (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        (you)
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile.email}
                  </p>
                </div>
              </div>

              <span className="hidden shrink-0 text-xs text-muted-foreground md:block">
                Joined {joinedFormat.format(new Date(profile.created_at))}
              </span>

              <RoleForm
                userId={profile.id}
                currentRole={profile.role}
                isSelf={isSelf}
              />
            </div>
          );
        })}

        {profiles.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-muted-foreground">
            No one has signed in yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}
