/**
 * localStorage key for the pending passwordless sign-in (email + sent time).
 * Written by the login form so a reload keeps the code-entry step; cleared once
 * the user reaches the authenticated app (see ClearPendingSignIn).
 */
export const SIGN_IN_STORAGE_KEY = "wf_signin";
