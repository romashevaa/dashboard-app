"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ArrowUpRight,
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

function draftToInput(
  draft: CredentialDraft,
  categoryNote: string
): CredentialInput {
  return {
    service: draft.service,
    account: draft.account ?? null,
    username: draft.username,
    password: draft.password,
    url: draft.url ?? null,
    noIcon: draft.noIcon ?? false,
    note: draft.note ?? null,
    categoryNote: categoryNote || null,
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
  const [, startTransition] = useTransition();

  const logins = useMemo(() => records.map(toLogin), [records]);

  // Service-level notes, derived from the records (one per service).
  const serviceNotes = useMemo(() => {
    const notes: Record<string, string> = {};
    for (const r of records) {
      if (r.categoryNote) notes[r.service] = r.categoryNote;
    }
    return notes;
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
    startTransition(async () => {
      const result = await deleteCredential(id);
      if (result.error) setError(result.error);
    });
  };

  const submit = async (draft: CredentialDraft, categoryNote: string) => {
    const input = draftToInput(draft, categoryNote);
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
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
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
        <p
          role="alert"
          className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
        >
          {error}
        </p>
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
              {serviceNotes[service] ? (
                <p className="text-sm font-medium text-accent-yellow">
                  {serviceNotes[service]}
                </p>
              ) : null}
            </div>
            <CredentialTable
              rows={rows}
              useAccountLabel
              isAdmin={isAdmin}
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
            onRemove={remove}
            onEdit={setEditing}
          />
        </section>
      ) : null}

      {empty ? (
        <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center text-sm text-muted-foreground">
          {query ? `No credentials match “${query}”.` : "No credentials yet."}
        </p>
      ) : null}

      {isAdmin && editing !== null ? (
        <CredentialModal
          key={editing === "new" ? "new" : editing.id}
          open
          onClose={() => setEditing(null)}
          services={serviceNames}
          initial={editing === "new" ? undefined : editing}
          initialCategoryNote={
            editing === "new" ? "" : serviceNotes[editing.service] ?? ""
          }
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}

function CredentialTable({
  rows,
  useAccountLabel = false,
  isAdmin = false,
  onRemove,
  onEdit,
}: {
  rows: Login[];
  useAccountLabel?: boolean;
  isAdmin?: boolean;
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
  onRemove,
  onEdit,
}: {
  login: Login;
  useAccountLabel: boolean;
  isAdmin: boolean;
  onRemove: (id: string) => void;
  onEdit: (login: Login) => void;
}) {
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
    <div className="group flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 transition-colors last:border-b-0 hover:bg-accent focus-within:bg-accent lg:flex-row lg:items-center lg:gap-4 lg:px-3 lg:py-3">
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

      <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4 shrink-0 lg:hidden" aria-hidden />
        <CopyText
          value={login.password}
          label="password"
          display={<span className="tracking-widest">•••••••••••</span>}
          iconClassName={reveal}
          onCopy={() => void logCredentialReveal(login.id)}
        />
      </div>

      {isAdmin ? (
        <div className="flex shrink-0 items-center justify-end gap-3 lg:w-16">
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
            onClick={() => onRemove(login.id)}
            aria-label={`Remove ${serviceLabel}`}
            className={cn(
              "shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/60",
              reveal
            )}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
