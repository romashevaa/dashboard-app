import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { getCurrentProfile } from "@/lib/auth/profile";

/**
 * Layout for all authenticated app routes. The proxy already gates these
 * paths; this re-checks server-side (RLS remains the primary guard) and makes
 * the profile/role available to the shell.
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
    <div className="flex min-h-dvh flex-col">
      <AppHeader email={profile.email} isAdmin={profile.role === "admin"} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
