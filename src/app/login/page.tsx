import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in · Webfolks Dashboard",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  const { redirectTo } = await searchParams;
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/";

  return (
    <main className="flex min-h-dvh items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Webfolks
          </span>
          <h1 className="text-xl font-semibold tracking-tight">
            Sign in to the dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your work email and we&apos;ll send you a sign-in link and a
            code — no password needed.
          </p>
        </div>

        <LoginForm redirectTo={safeRedirect} />
      </div>
    </main>
  );
}
