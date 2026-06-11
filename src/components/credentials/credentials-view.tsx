"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Info,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createCredential,
  deleteCredential,
  logCredentialReveal,
  updateCredential,
  updateServiceNote,
  type CredentialInput,
} from "@/lib/credentials/actions";
import type { CredentialRecord } from "@/lib/credentials/data";
import { CredentialModal, type CredentialDraft } from "./credential-modal";
import { CopyText } from "./copy-text";
import { ServiceAvatar } from "./service-avatar";

type Login = {
  id: string;
  service: string;
  /** Account label shown instead of the service name (for grouped services). */
  account?: string;
  username: string;
  password: string;
  url?: string;
  iconUrl?: string;
  noIcon?: boolean;
  /** Per-row note, rendered in brand yellow. */
  note?: string;
};

function toLogin(record: CredentialRecord): Login {
  return {
    id: record.id,
    service: record.service,
    account: record.account ?? undefined,
    username: record.username,
    password: record.password,
    url: record.url ?? undefined,
    iconUrl: record.iconUrl ?? undefined,
    noIcon: record.noIcon,
    note: record.note ?? undefined,
  };
}

function draftToInput(draft: CredentialDraft): CredentialInput {
  return {
    service: draft.service,
    account: draft.account ?? null,
    username: draft.username,
    password: draft.password,
    url: draft.url ?? null,
    noIcon: draft.noIcon ?? false,
    note: draft.note ?? null,
  };
}

function matches(login: Login, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    login.service.toLowerCase().includes(q) ||
    login.username.toLowerCase().includes(q) ||
    (login.account?.toLowerCase().includes(q) ?? false)
  );
}

export function CredentialsView({
  records,
  isAdmin = false,
}: {
  records: CredentialRecord[];
  isAdmin?: boolean;
}) {
  const [query, setQuery] = useState("");
  // null = closed, "new" = add, Login = edit that row.
  const [editing, setEditing] = useState<Login | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  // Make the advertised ⌘F shortcut real: focus the search field instead of
  // the browser's find-in-page (skip it while the modal is open).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
        if (document.querySelector("[role=dialog]")) return;
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const logins = useMemo(() => records.map(toLogin), [records]);

  // Service-level notes + ids, derived from the records (one per service).
  const services = useMemo(() => {
    const byName: Record<string, { id: string; note: string | null }> = {};
    for (const r of records) {
      byName[r.service] = { id: r.serviceId, note: r.categoryNote };
    }
    return byName;
  }, [records]);

  const { groups, singles } = useMemo(() => {
    const filtered = logins.filter((l) => matches(l, query));
    const byService = new Map<string, Login[]>();
    for (const login of filtered) {
      const list = byService.get(login.service);
      if (list) list.push(login);
      else byService.set(login.service, [login]);
    }
    const groups: [string, Login[]][] = [];
    const singles: Login[] = [];
    for (const [service, list] of byService) {
      if (list.length >= 2) groups.push([service, list]);
      else singles.push(...list);
    }
    return { groups, singles };
  }, [logins, query]);

  const serviceNames = useMemo(
    () => [...new Set(logins.map((l) => l.service))].sort(),
    [logins]
  );

  const remove = (id: string) => {
    setError(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCredential(id);
      if (result.error) setError(result.error);
      setDeletingId(null);
    });
  };

  const submit = async (draft: CredentialDraft) => {
    const input = draftToInput(draft);
    const result =
      editing && editing !== "new"
        ? await updateCredential(editing.id, input)
        : await createCredential(input);
    if (result.error) return { error: result.error };
    return;
  };

  const empty = groups.length === 0 && singles.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-12 flex-1 items-center gap-2 rounded-lg border border-white/[0.06] bg-background px-4 transition-colors focus-within:border-ring/60">
          <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setQuery("");
                e.currentTarget.blur();
              }
            }}
            placeholder="Search by service or username…"
            aria-label="Search credentials"
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-white/40 md:text-sm"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
            >
              <X className="size-4" aria-hidden />
            </button>
          ) : (
            <div
              aria-hidden
              className="hidden shrink-0 items-center gap-1 sm:flex"
            >
              <kbd className="rounded border border-white/[0.12] bg-surface px-1.5 py-0.5 text-xs text-muted-foreground">
                ⌘
              </kbd>
              <kbd className="rounded border border-white/[0.12] bg-surface px-1.5 py-0.5 text-xs text-muted-foreground">
                F
              </kbd>
            </div>
          )}
        </div>
        {isAdmin ? (
          <Button
            type="button"
            onClick={() => setEditing("new")}
            className="h-12 shrink-0"
          >
            <Plus className="size-4" aria-hidden />
            Add credential
          </Button>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="shrink-0 rounded outline-none transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-destructive/60"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}

      {groups.map(([service, rows]) => {
        const head = rows.find((r) => r.iconUrl) ?? rows[0];
        return (
          <section key={service} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ServiceAvatar
                  name={service}
                  iconUrl={head?.iconUrl}
                  noIcon={head?.noIcon}
                />
                <h2 className="text-lg font-semibold tracking-tight">{service}</h2>
              </div>
              <ServiceNote
                serviceId={services[service]?.id}
                note={services[service]?.note ?? null}
                isAdmin={isAdmin}
              />
            </div>
            <CredentialTable
              rows={rows}
              useAccountLabel
              isAdmin={isAdmin}
              deletingId={deletingId}
              onRemove={remove}
              onEdit={setEditing}
            />
          </section>
        );
      })}

      {singles.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">All logins</h2>
          <CredentialTable
            rows={singles}
            isAdmin={isAdmin}
            deletingId={deletingId}
            onRemove={remove}
            onEdit={setEditing}
          />
        </section>
      ) : null}

      {empty ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            {query ? (
              <>No credentials match “{query}”.</>
            ) : isAdmin ? (
              "No credentials yet — add the first one."
            ) : (
              "No credentials yet."
            )}
          </p>
          {query ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setQuery("");
                searchRef.current?.focus();
              }}
            >
              Clear search
            </Button>
          ) : isAdmin ? (
            <Button type="button" onClick={() => setEditing("new")}>
              <Plus className="size-4" aria-hidden />
              Add credential
            </Button>
          ) : null}
        </div>
      ) : null}

      {isAdmin && editing !== null ? (
        <CredentialModal
          key={editing === "new" ? "new" : editing.id}
          open
          onClose={() => setEditing(null)}
          services={serviceNames}
          initial={editing === "new" ? undefined : editing}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}

/**
 * The service-level (category) note under a grouped service's heading. This is
 * the single place it's viewed and — for admins — edited inline, instead of
 * being buried in individual login modals.
 */
function ServiceNote({
  serviceId,
  note,
  isAdmin,
}: {
  serviceId?: string;
  note: string | null;
  isAdmin: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  if (!isAdmin) {
    return note ? (
      <p className="text-sm font-medium text-accent-yellow">{note}</p>
    ) : null;
  }

  const save = () => {
    if (!serviceId) return;
    startTransition(async () => {
      await updateServiceNote(serviceId, draft);
      setEditing(false);
    });
  };

  if (editing) {
    return (
      <div className="flex max-w-xl items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          autoFocus
          disabled={pending}
          placeholder="Note for this service, e.g. Ask in #shared-creds first"
          aria-label="Service note"
          className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm text-accent-yellow outline-none transition-colors placeholder:text-white/40 focus-visible:border-ring disabled:opacity-60"
        />
        <button
          type="button"
          onClick={save}
          disabled={pending}
          aria-label="Save note"
          className="shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60"
        >
          <Check className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={pending}
          aria-label="Cancel editing note"
          className="shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-60"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  const startEditing = () => {
    setDraft(note ?? "");
    setEditing(true);
  };

  return note ? (
    <p className="group/note flex items-center gap-2 text-sm font-medium text-accent-yellow">
      <span>{note}</span>
      <button
        type="button"
        onClick={startEditing}
        aria-label="Edit service note"
        className="shrink-0 rounded text-muted-foreground opacity-0 outline-none transition-opacity hover:text-white focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/60 group-hover/note:opacity-100"
      >
        <Pencil className="size-3.5" aria-hidden />
      </button>
    </p>
  ) : (
    <button
      type="button"
      onClick={startEditing}
      className="self-start text-xs font-medium text-muted-foreground underline-offset-4 outline-none transition-colors hover:text-foreground hover:underline focus-visible:text-foreground"
    >
      + Add service note
    </button>
  );
}

function CredentialTable({
  rows,
  useAccountLabel = false,
  isAdmin = false,
  deletingId,
  onRemove,
  onEdit,
}: {
  rows: Login[];
  useAccountLabel?: boolean;
  isAdmin?: boolean;
  deletingId: string | null;
  onRemove: (id: string) => void;
  onEdit: (login: Login) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Column headers — only the wide (lg) table layout uses them. */}
      <div className="hidden gap-4 px-3 text-xs font-semibold uppercase tracking-wider text-white/40 lg:flex">
        <span className="flex-1">Service</span>
        <span className="flex flex-1 items-center gap-1.5">
          <User className="size-4" aria-hidden /> User name
        </span>
        <span className="flex flex-1 items-center gap-1.5">
          <Lock className="size-4" aria-hidden /> Password
        </span>
        {isAdmin ? <span className="w-16 shrink-0" /> : null}
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-background">
        {rows.map((login) => (
          <CredentialRow
            key={login.id}
            login={login}
            useAccountLabel={useAccountLabel}
            isAdmin={isAdmin}
            deleting={deletingId === login.id}
            onRemove={onRemove}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  );
}

function CredentialRow({
  login,
  useAccountLabel,
  isAdmin,
  deleting,
  onRemove,
  onEdit,
}: {
  login: Login;
  useAccountLabel: boolean;
  isAdmin: boolean;
  deleting: boolean;
  onRemove: (id: string) => void;
  onEdit: (login: Login) => void;
}) {
  // Deleting is destructive and immediate — require a second click to confirm.
  const [confirming, setConfirming] = useState(false);
  const serviceLabel = useAccountLabel ? login.account ?? login.service : login.service;
  // Below lg the rows stack into cards (actions always visible); at lg they
  // become table columns where actions reveal on hover or keyboard focus.
  const reveal =
    "opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100";

  const serviceInner = (
    <>
      <ServiceAvatar
        name={login.service}
        iconUrl={login.iconUrl}
        noIcon={login.noIcon}
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
          <span className="truncate">{serviceLabel}</span>
          {login.url ? (
            <ArrowUpRight
              className={cn("size-3.5 shrink-0 text-muted-foreground", reveal)}
              aria-hidden
            />
          ) : null}
        </p>
        {login.note ? (
          <span className="flex items-center gap-1.5 text-xs text-accent-yellow">
            <Info className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{login.note}</span>
          </span>
        ) : null}
      </div>
    </>
  );

  return (
    <div
      onMouseLeave={() => setConfirming(false)}
      className={cn(
        "group flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 transition-colors last:border-b-0 hover:bg-accent focus-within:bg-accent lg:flex-row lg:items-center lg:gap-4 lg:px-3 lg:py-3",
        deleting && "pointer-events-none opacity-40"
      )}
    >
      {login.url ? (
        <a
          href={login.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${serviceLabel}`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded outline-none transition-colors hover:[&_p]:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          {serviceInner}
        </a>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-2">{serviceInner}</div>
      )}

      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
        <User className="size-4 shrink-0 lg:hidden" aria-hidden />
        <CopyText value={login.username} label="username" iconClassName={reveal} />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4 shrink-0 lg:hidden" aria-hidden />
        <PasswordCell login={login} revealClass={reveal} />
      </div>

      {isAdmin ? (
        <div className="flex shrink-0 items-center justify-end gap-3 lg:w-16">
          {confirming ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setConfirming(false);
                  onRemove(login.id);
                }}
                aria-label={`Confirm removing ${serviceLabel}`}
                className="shrink-0 rounded text-destructive outline-none transition-colors hover:text-destructive/80 focus-visible:ring-2 focus-visible:ring-destructive/60"
              >
                <Check className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                aria-label="Cancel removal"
                className="shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                <X className="size-4" aria-hidden />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(login)}
                aria-label={`Edit ${serviceLabel}`}
                className={cn(
                  "shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60",
                  reveal
                )}
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                aria-label={`Remove ${serviceLabel}`}
                className={cn(
                  "shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/60",
                  reveal
                )}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Masked password with copy-to-clipboard plus an eye toggle to reveal it
 * in place (for when it must be typed somewhere, not pasted). Both copying
 * and revealing write a `reveal` audit event.
 */
function PasswordCell({
  login,
  revealClass,
}: {
  login: Login;
  revealClass: string;
}) {
  const [shown, setShown] = useState(false);

  const toggle = () => {
    setShown((prev) => {
      const next = !prev;
      if (next) void logCredentialReveal(login.id);
      return next;
    });
  };

  return (
    <>
      <CopyText
        value={login.password}
        label="password"
        display={
          shown ? (
            <span className="font-mono text-[13px]">{login.password}</span>
          ) : (
            <span className="tracking-widest">•••••••••••</span>
          )
        }
        iconClassName={revealClass}
        onCopy={() => void logCredentialReveal(login.id)}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        className={cn(
          "shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60",
          // While revealed, keep the toggle visible so it can be hidden again.
          shown ? "opacity-100" : revealClass
        )}
      >
        {shown ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
      </button>
    </>
  );
}
