"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/db/types";
import { updateMyProfile, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-white/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 md:h-10 md:text-sm";

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5 text-sm font-medium">
      <span className="flex items-baseline gap-2">
        {label}
        {hint ? (
          <span className="text-xs font-normal text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction, pending] = useActionState(
    updateMyProfile,
    initialState
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="First name" htmlFor="first_name">
          <input
            id="first_name"
            name="first_name"
            required
            defaultValue={profile.first_name ?? ""}
            placeholder="Roman"
            className={inputClass}
          />
        </Field>
        <Field label="Last name" htmlFor="last_name">
          <input
            id="last_name"
            name="last_name"
            required
            defaultValue={profile.last_name ?? ""}
            placeholder="Sheva"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Team position" htmlFor="position">
        <input
          id="position"
          name="position"
          defaultValue={profile.position ?? ""}
          placeholder="e.g. Webflow Developer"
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Birthdate" htmlFor="birthdate" hint="optional">
          <input
            id="birthdate"
            name="birthdate"
            type="date"
            defaultValue={profile.birthdate ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Hire date" htmlFor="hire_date" hint="when you joined">
          <input
            id="hire_date"
            name="hire_date"
            type="date"
            defaultValue={profile.hire_date ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone" hint="optional">
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ""}
            placeholder="+380 …"
            className={inputClass}
          />
        </Field>
        <Field label="Telegram" htmlFor="telegram" hint="optional">
          <input
            id="telegram"
            name="telegram"
            defaultValue={profile.telegram ?? ""}
            placeholder="@username"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
        {state.error ? (
          <span role="alert" className="text-sm text-destructive">
            {state.error}
          </span>
        ) : state.ok ? (
          <span className="flex items-center gap-1.5 text-sm text-brand-light">
            <Check className="size-4" aria-hidden />
            Saved
          </span>
        ) : null}
      </div>
    </form>
  );
}
