"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Lock, Plus, Search, Trash2, User, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AddCredentialModal, type NewLogin } from "./add-credential-modal";
import { CopyButton } from "./copy-button";
import { ServiceAvatar, faviconFor } from "./service-avatar";

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

// Sample data — replaced by a `credentials` table + RLS when the feature is
// wired up. Passwords are placeholders.
const wf = (account: string, username: string): Login => ({
  id: `wf-${account}`,
  service: "Webflow",
  account,
  username,
  password: `${username}-pw`,
  url: "https://webflow.com",
});

const INITIAL: Login[] = [
  wf("DevAccount", "dev-webflow"),
  wf("ProAccount", "pro-webflow"),
  wf("HexAccount", "hex-webflow"),
  wf("HiWebfolks", "hi-webflow"),
  { id: "wf-extra", service: "Webflow", account: "Marketing", username: "mkt-webflow", password: "mkt-pw", url: "https://webflow.com" },
  { id: "ui8", service: "UI8", username: "usernameforui", password: "ui8-pw", url: "https://ui8.net" },
  { id: "adobe", service: "Adobe Creative Cloud", username: "usernameforui", password: "adobe-pw", url: "https://adobe.com", note: "Feel free to log out the oldest user." },
  { id: "loom", service: "Loom", username: "loomuser", password: "loom-pw", url: "https://loom.com" },
  { id: "freepik", service: "Freepik", username: "freepickuser", password: "freepik-pw", url: "https://freepik.com" },
];

// Service-level notes (rendered under a grouped service's heading).
const SERVICE_NOTES: Record<string, string> = {
  Webflow:
    "Please ask in the #shared-creds channel if someone's using a Webflow account you need to log in to.",
};

function matches(login: Login, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    login.service.toLowerCase().includes(q) ||
    login.username.toLowerCase().includes(q) ||
    (login.account?.toLowerCase().includes(q) ?? false)
  );
}

export function CredentialsView({ isAdmin = false }: { isAdmin?: boolean }) {
  const [logins, setLogins] = useState<Login[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);

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

  const remove = (id: string) => setLogins((ls) => ls.filter((l) => l.id !== id));

  const add = (login: NewLogin) =>
    setLogins((ls) => [
      ...ls,
      {
        ...login,
        id: `c-${Date.now()}`,
        iconUrl: login.iconUrl ?? (login.url ? faviconFor(login.url) : undefined),
      },
    ]);

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
          ) : null}
        </div>
        {isAdmin ? (
          <Button
            type="button"
            onClick={() => setAdding(true)}
            className="h-12 shrink-0 sm:h-10"
          >
            <Plus className="size-4" aria-hidden />
            Add credential
          </Button>
        ) : null}
      </div>

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
              {SERVICE_NOTES[service] ? (
                <p className="text-sm font-medium text-accent-yellow">
                  {SERVICE_NOTES[service]}
                </p>
              ) : null}
            </div>
            <CredentialTable rows={rows} useAccountLabel isAdmin={isAdmin} onRemove={remove} />
          </section>
        );
      })}

      {singles.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">All logins</h2>
          <CredentialTable rows={singles} isAdmin={isAdmin} onRemove={remove} />
        </section>
      ) : null}

      {empty ? (
        <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center text-sm text-muted-foreground">
          {query ? `No credentials match “${query}”.` : "No credentials yet."}
        </p>
      ) : null}

      {isAdmin ? (
        <AddCredentialModal
          open={adding}
          onClose={() => setAdding(false)}
          services={serviceNames}
          onAdd={add}
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
}: {
  rows: Login[];
  useAccountLabel?: boolean;
  isAdmin?: boolean;
  onRemove: (id: string) => void;
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
        <span className="w-28 shrink-0" />
      </div>

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-background">
        {rows.map((login) => (
          <CredentialRow
            key={login.id}
            login={login}
            useAccountLabel={useAccountLabel}
            isAdmin={isAdmin}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

function OpenSiteLink({ url, className }: { url: string; className?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-surface px-2.5 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60",
        className
      )}
    >
      Open Site
      <ArrowUpRight className="size-4" aria-hidden />
    </a>
  );
}

function CredentialRow({
  login,
  useAccountLabel,
  isAdmin,
  onRemove,
}: {
  login: Login;
  useAccountLabel: boolean;
  isAdmin: boolean;
  onRemove: (id: string) => void;
}) {
  const serviceLabel = useAccountLabel ? login.account ?? login.service : login.service;
  // Below lg the rows stack into cards (actions always visible); at lg they
  // become table columns where actions reveal on hover or keyboard focus.
  const onHover =
    "opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100";

  return (
    <div className="group flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 transition-colors last:border-b-0 hover:bg-accent focus-within:bg-accent lg:flex-row lg:items-center lg:gap-4 lg:px-3 lg:py-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ServiceAvatar
          name={login.service}
          iconUrl={login.iconUrl}
          noIcon={login.noIcon}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {serviceLabel}
          </p>
          {login.note ? (
            <p className="text-xs text-accent-yellow">{login.note}</p>
          ) : null}
        </div>
        {login.url ? <OpenSiteLink url={login.url} className="lg:hidden" /> : null}
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
        <User className="size-4 shrink-0 lg:hidden" aria-hidden />
        <span className="truncate">{login.username}</span>
        <CopyButton value={login.username} label="username" className={onHover} />
      </div>

      <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4 shrink-0 lg:hidden" aria-hidden />
        <span className="tracking-widest">•••••••••••</span>
        <CopyButton value={login.password} label="password" className={onHover} />
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 lg:w-28">
        {login.url ? <OpenSiteLink url={login.url} className={cn("hidden lg:inline-flex", onHover)} /> : null}
        {isAdmin ? (
          <button
            type="button"
            onClick={() => onRemove(login.id)}
            aria-label={`Remove ${serviceLabel}`}
            className={cn(
              "shrink-0 rounded text-muted-foreground outline-none transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/60",
              onHover
            )}
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
