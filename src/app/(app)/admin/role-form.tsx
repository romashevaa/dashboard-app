"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { APP_ROLES, type AppRole } from "@/lib/db/types";
import { updateUserRole, type UpdateRoleState } from "./actions";

const initialState: UpdateRoleState = {};

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
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
        disabled={isSelf}
        aria-label="Role"
        className="h-9 rounded-md border border-input bg-background px-2 text-sm capitalize outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
      >
        {APP_ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" disabled={pending || isSelf}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.error ? (
        <span className="text-xs text-destructive">{state.error}</span>
      ) : null}
      {state.ok ? (
        <span className="text-xs text-muted-foreground">Saved</span>
      ) : null}
    </form>
  );
}
