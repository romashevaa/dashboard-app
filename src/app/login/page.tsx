import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in · Webfolks Dashboard",
};

export default function LoginPage() {
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
            Enter your work email and we&apos;ll send you a magic link — no
            password needed.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
