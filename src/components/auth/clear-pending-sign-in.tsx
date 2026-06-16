"use client";

import { useEffect } from "react";

import { SIGN_IN_STORAGE_KEY } from "@/lib/auth/sign-in-storage";

/**
 * Clears the pending sign-in saved by the login form. Rendered inside the
 * authenticated app shell, so once a user is signed in the saved email/cooldown
 * is dropped — otherwise, after signing out, the login screen would restore the
 * old "code sent" step instead of starting fresh.
 */
export function ClearPendingSignIn() {
  useEffect(() => {
    try {
      localStorage.removeItem(SIGN_IN_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  return null;
}
