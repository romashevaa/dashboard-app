"use client";

import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ServiceAvatar, faviconFor } from "./service-avatar";

export type NewLogin = {
  service: string;
  account?: string;
  username: string;
  password: string;
  url?: string;
  iconUrl?: string;
  noIcon?: boolean;
};

const inputClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base text-foreground outline-none transition-colors placeholder:text-white/40 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 md:h-10 md:text-sm";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium">
      {label}
      {children}
      {hint ? (
        <span className="text-xs font-normal text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

export function AddCredentialModal({
  open,
  onClose,
  services,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  /** Existing service names, offered for grouping. */
  services: string[];
  onAdd: (login: NewLogin) => void;
}) {
  const listId = useId();
  const [service, setService] = useState("");
  const [account, setAccount] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [noIcon, setNoIcon] = useState(false);

  const iconUrl = noIcon ? undefined : faviconFor(url);
  const canSubmit =
    service.trim() && username.trim() && password.trim();

  function reset() {
    setService("");
    setAccount("");
    setUsername("");
    setPassword("");
    setUrl("");
    setNoIcon(false);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;
    onAdd({
      service: service.trim(),
      account: account.trim() || undefined,
      username: username.trim(),
      password,
      url: url.trim() || undefined,
      iconUrl,
      noIcon,
    });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Add credential">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-end gap-3">
          <ServiceAvatar
            name={service || "?"}
            iconUrl={iconUrl}
            noIcon={noIcon}
            className="size-11 text-base"
          />
          <div className="flex-1">
            <Field label="Service">
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
        </div>

        <Field
          label="Account label"
          hint="Optional — distinguishes multiple logins for the same service (e.g. DevAccount)."
        >
          <input
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder="e.g. DevAccount"
            className={inputClass}
          />
        </Field>

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

        <Field label="Website URL" hint="We'll grab the site's icon automatically.">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://webflow.com"
            className={inputClass}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={noIcon}
            onChange={(e) => setNoIcon(e.target.checked)}
            className="size-4 accent-brand"
          />
          Use a letter instead of a website icon
        </label>

        <div className="mt-1 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            Add credential
          </Button>
        </div>
      </form>
    </Modal>
  );
}
