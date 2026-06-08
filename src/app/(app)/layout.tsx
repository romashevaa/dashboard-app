import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentProfile } from "@/lib/auth/profile";
import type { Profile } from "@/lib/db/types";

function displayName(profile: Profile): string {
  if (profile.full_name) return profile.full_name;
  return profile.email.split("@")[0] ?? profile.email;
}

/**
 * Layout for all authenticated app routes. The proxy already gates these
 * paths; this re-checks server-side (RLS remains the primary guard) and
 * renders the Figma-styled shell (sidebar + content panel).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar isAdmin={profile.role === "admin"} />

      <div className="flex flex-1 flex-col gap-4 pr-4 pt-4 pb-4">
        <header className="flex items-center justify-between pl-2">
          <p className="text-xl font-semibold tracking-tight">
            👋 Hello, {displayName(profile)}!
          </p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              aria-label="Sign out"
              className="grid size-8 place-items-center rounded border border-white/10 text-muted-foreground transition-colors hover:text-white"
            >
              <LogOut className="size-4" aria-hidden />
            </button>
          </form>
        </header>

        <main className="flex-1 rounded-lg border border-white/10 bg-surface p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
