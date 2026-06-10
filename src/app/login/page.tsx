import type { Metadata } from "next";

import { WebfolksLogo } from "@/components/layout/webfolks-logo";
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
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4">
          <WebfolksLogo className="h-7 self-start" />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold tracking-tight">
              Sign in to the dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your work email and we&apos;ll send you a sign-in link and a
              code — no password needed.
            </p>
          </div>
        </div>

        <LoginForm redirectTo={safeRedirect} />
      </div>
    </main>
  );
}
