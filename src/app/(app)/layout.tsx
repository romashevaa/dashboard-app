import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
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

  const isAdmin = profile.role === "admin";

  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar isAdmin={isAdmin} className="sticky top-0 hidden md:flex" />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 px-4 py-3 md:py-4 md:pr-4 md:pl-2">
          <MobileNav isAdmin={isAdmin} />
          <p className="min-w-0 flex-1 truncate text-lg font-semibold tracking-tight md:text-xl">
            👋 Hello, {displayName(profile)}!
          </p>
          <form action="/auth/signout" method="post">
            <Button
              type="submit"
              variant="outline"
              size="icon"
              aria-label="Sign out"
              className="shrink-0 text-muted-foreground"
            >
              <LogOut className="size-4" aria-hidden />
            </Button>
          </form>
        </header>

        <main className="flex-1 border-t border-white/10 bg-surface p-4 md:mx-4 md:mb-4 md:rounded-lg md:border md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
