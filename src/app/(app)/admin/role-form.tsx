"use client";

import { useActionState } from "react";
import { Check, Loader2, TriangleAlert } from "lucide-react";

import { APP_ROLES, type AppRole } from "@/lib/db/types";
import { updateUserRole, type UpdateRoleState } from "./actions";

const initialState: UpdateRoleState = {};

/**
 * Role picker for one user. Saves on change (no separate button) and shows a
 * compact inline status. Your own row is locked so an admin can't demote
 * themselves by accident (the server action re-checks this too).
 */
export function RoleForm({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: AppRole;
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateUserRole,
    initialState
  );

  return (
    <form action={formAction} className="flex shrink-0 items-center gap-2">
      <input type="hidden" name="userId" value={userId} />

      {/* Status sits left of the select so the row width never jumps. */}
      <span className="grid w-5 place-items-center" aria-live="polite">
        {pending ? (
          <Loader2
            className="size-4 animate-spin text-muted-foreground"
            aria-label="Saving"
          />
        ) : state.error ? (
          <TriangleAlert className="size-4 text-destructive" aria-hidden />
        ) : state.ok ? (
          <Check className="size-4 text-brand-light" aria-label="Saved" />
        ) : null}
      </span>

      <select
        name="role"
        defaultValue={currentRole}
        disabled={isSelf || pending}
        aria-label="Role"
        title={isSelf ? "You can't change your own role" : undefined}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm capitalize outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
      >
        {APP_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>

      {state.error ? (
        <span role="alert" className="text-xs text-destructive">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
