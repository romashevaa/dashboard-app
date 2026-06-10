"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ServiceAvatar, faviconFor } from "./service-avatar";

export type CredentialDraft = {
  service: string;
  account?: string;
  username: string;
  password: string;
  url?: string;
  iconUrl?: string;
  noIcon?: boolean;
  note?: string;
};

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-white/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 md:h-10 md:text-sm";

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-medium ${className ?? ""}`}>
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

export function CredentialModal({
  open,
  onClose,
  services,
  initial,
  initialCategoryNote = "",
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  /** Existing service names, offered for grouping. */
  services: string[];
  /** Present → edit mode; absent → add mode. */
  initial?: CredentialDraft;
  initialCategoryNote?: string;
  onSubmit: (draft: CredentialDraft, categoryNote: string) => void;
}) {
  const listId = useId();
  const isEdit = Boolean(initial);

  const [service, setService] = useState(initial?.service ?? "");
  const [account, setAccount] = useState(initial?.account ?? "");
  const [username, setUsername] = useState(initial?.username ?? "");
  const [password, setPassword] = useState(initial?.password ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [noIcon, setNoIcon] = useState(initial?.noIcon ?? false);
  const [note, setNote] = useState(initial?.note ?? "");
  const [categoryNote, setCategoryNote] = useState(initialCategoryNote);
  const [showNotes, setShowNotes] = useState(
    Boolean(initial?.note || initialCategoryNote)
  );

  const iconUrl = noIcon
    ? undefined
    : url
      ? faviconFor(url)
      : initial?.iconUrl;
  const canSubmit = service.trim() && username.trim() && password.trim();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit(
      {
        service: service.trim(),
        account: account.trim() || undefined,
        username: username.trim(),
        password,
        url: url.trim() || undefined,
        iconUrl,
        noIcon,
        note: note.trim() || undefined,
      },
      categoryNote.trim()
    );
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit credential" : "Add credential"}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <ServiceAvatar
            name={service || "?"}
            iconUrl={iconUrl}
            noIcon={noIcon}
            className="size-11 text-base"
          />
          <Field label="Service" className="flex-1">
            <input
              list={listId}
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder="e.g. Webflow, Claude"
              autoFocus
              required
              className={inputClass}
            />
            <datalist id={listId}>
              {services.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Username">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              className={inputClass}
            />
          </Field>
          <Field label="Password">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              required
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Account label" hint="optional">
            <input
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder="e.g. DevAccount"
              className={inputClass}
            />
          </Field>
          <Field label="Website URL" hint="fetches the icon">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://webflow.com"
              className={inputClass}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={noIcon}
            onChange={(e) => setNoIcon(e.target.checked)}
            className="size-4 accent-brand"
          />
          Use a letter instead of the site icon
        </label>

        {showNotes ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Note for this login" hint="yellow, on the row">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Log out the oldest user"
                className={inputClass}
              />
            </Field>
            <Field label="Category note" hint="under the heading">
              <input
                value={categoryNote}
                onChange={(e) => setCategoryNote(e.target.value)}
                placeholder="e.g. Ask in #shared-creds first"
                className={inputClass}
              />
            </Field>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNotes(true)}
            className="self-start text-sm font-medium text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:text-foreground"
          >
            + Add a note
          </button>
        )}

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {isEdit ? "Save changes" : "Add credential"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
