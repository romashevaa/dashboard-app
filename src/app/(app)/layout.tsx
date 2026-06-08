import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { createClient } from "@/lib/supabase/server";

/**
 * Layout for all authenticated app routes. Middleware already gates these
 * paths; this re-checks server-side (RLS remains the primary guard) and makes
 * the user available to the shell.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader email={user.email ?? null} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
