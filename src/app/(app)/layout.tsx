import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/layout/page-title";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ClearPendingSignIn } from "@/components/auth/clear-pending-sign-in";
import { WelcomeModal } from "@/components/profile/welcome-modal";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getViewerContext } from "@/lib/auth/profile";
import { isProfileComplete, type Profile } from "@/lib/db/types";

function displayName(profile: Profile): string {
  const base =
    profile.full_name?.trim() || profile.email.split("@")[0] || profile.email;
  // Always start with a capital letter (email-derived names are lowercase).
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Layout for all authenticated app routes. The proxy already gates these
 * paths; this re-checks server-side (RLS remains the primary guard) and
 * renders the Figma-styled shell: flush sidebar + a single surface panel that
 * holds the greeting bar and the page content.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, isAdmin, isRealAdmin, previewingAsMember } =
    await getViewerContext();

  if (!profile) {
    redirect("/login");
  }

  const name = displayName(profile);
  const profileComplete = isProfileComplete(profile);

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <ClearPendingSignIn />
      <WelcomeModal
        open={!profile.welcomed_at}
        firstName={profile.first_name?.trim() || name}
      />
      <Sidebar
        isAdmin={isAdmin}
        isRealAdmin={isRealAdmin}
        previewingAsMember={previewingAsMember}
        className="hidden md:flex"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:py-2 md:pr-2">
        <div className="flex min-h-0 flex-1 flex-col gap-6 border-t border-white/10 bg-surface p-4 md:rounded-xl md:border md:p-6">
          <header className="flex items-center gap-3">
            <MobileNav
              isAdmin={isAdmin}
              isRealAdmin={isRealAdmin}
              previewingAsMember={previewingAsMember}
            />
            <PageTitle name={name} />
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/profile"
                aria-label={
                  profileComplete
                    ? "Your profile"
                    : "Your profile — complete your details"
                }
                className="relative rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <UserAvatar
                  name={name}
                  src={profile.avatar_url}
                  className="size-9 rounded-md bg-white/10 text-sm transition-colors hover:bg-white/[0.16]"
                />
                {!profileComplete ? (
                  <span
                    aria-hidden
                    className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-destructive ring-2 ring-surface"
                  />
                ) : null}
              </Link>
              <form action="/auth/signout" method="post">
                <Button
                  type="submit"
                  variant="outline"
                  size="icon"
                  aria-label="Sign out"
                  className="text-muted-foreground"
                >
                  <LogOut className="size-4" aria-hidden />
                </Button>
              </form>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
