import type { Metadata } from "next";

import { WebfolksLogo } from "@/components/layout/webfolks-logo";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in · Webfolks Dashboard",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; error?: string }>;
}) {
  const { redirectTo, error } = await searchParams;
  const safeRedirect =
    redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
      ? redirectTo
      : "/";

  const authError =
    error === "domain"
      ? "That address isn't a Webfolks email."
      : error === "auth"
        ? "That sign-in link didn't work or has expired. Enter the code from your email, or request a new one."
        : null;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-background p-8 shadow-sm">
        <div className="mb-6 flex flex-col gap-4">
          <WebfolksLogo className="h-7 self-start" />
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Use your Webfolks email — no password needed.
            </p>
          </div>
        </div>

        <LoginForm redirectTo={safeRedirect} authError={authError} />
      </div>
    </main>
  );
}
