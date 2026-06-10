"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Lock, Search, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { ServiceIcon } from "./service-icon";

type Login = {
  id: string;
  service: string;
  /** Account label shown instead of the service name (for grouped services). */
  account?: string;
  username: string;
  password: string;
  url?: string;
  /** Per-row note, rendered in brand yellow. */
  note?: string;
};

// Sample data — replaced by a `credentials` table + RLS when the feature is
// wired up. Passwords are placeholders.
const FEATURED_SERVICE = "Webflow";
const FEATURED_NOTE =
  "Please ask in the #shared-creds channel if someone's using a Webflow account you need to log in to.";

const FEATURED: Login[] = [
  { id: "wf-dev", service: "Webflow", account: "DevAccount", username: "dev-webflow", password: "dev-webflow-pw", url: "https://webflow.com" },
  { id: "wf-pro", service: "Webflow", account: "ProAccount", username: "pro-webflow", password: "pro-webflow-pw", url: "https://webflow.com" },
  { id: "wf-hex", service: "Webflow", account: "HexAccount", username: "hex-webflow", password: "hex-webflow-pw", url: "https://webflow.com" },
  { id: "wf-hi", service: "Webflow", account: "HiWebfolks", username: "hi-webflow", password: "hi-webflow-pw", url: "https://webflow.com" },
];

const ALL_LOGINS: Login[] = [
  { id: "ui8", service: "UI8", username: "usernameforui", password: "ui8-pw", url: "https://ui8.net" },
  { id: "adobe", service: "Adobe Creative Cloud", username: "usernameforui", password: "adobe-pw", url: "https://adobe.com", note: "Feel free to log out the oldest user." },
  { id: "loom", service: "Loom", username: "loomuser", password: "loom-pw", url: "https://loom.com" },
  { id: "webflow", service: "Webflow", username: "usernameforui", password: "webflow-pw", url: "https://webflow.com" },
  { id: "freepik", service: "Freepik", username: "freepickuser", password: "freepik-pw", url: "https://freepik.com" },
];

function matches(login: Login, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    login.service.toLowerCase().includes(q) ||
    login.username.toLowerCase().includes(q) ||
    (login.account?.toLowerCase().includes(q) ?? false)
  );
}

export function CredentialsView() {
  const [query, setQuery] = useState("");

  const featured = useMemo(() => FEATURED.filter((l) => matches(l, query)), [query]);
  const all = useMemo(() => ALL_LOGINS.filter((l) => matches(l, query)), [query]);
  const empty = featured.length === 0 && all.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex h-12 items-center gap-2 rounded-lg border border-white/[0.06] bg-background px-4">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by service or username…"
          aria-label="Search credentials"
          className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-white/40 md:text-sm"
        />
      </div>

      {featured.length > 0 ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <ServiceIcon name={FEATURED_SERVICE} />
              <h2 className="text-lg font-semibold tracking-tight">
                {FEATURED_SERVICE}
              </h2>
            </div>
            <p className="text-sm font-medium text-accent-yellow">
              {FEATURED_NOTE}
            </p>
          </div>
          <CredentialTable rows={featured} useAccountLabel />
        </section>
      ) : null}

      {all.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold tracking-tight">All logins</h2>
          <CredentialTable rows={all} />
        </section>
      ) : null}

      {empty ? (
        <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center text-sm text-muted-foreground">
          No credentials match “{query}”.
        </p>
      ) : null}
    </div>
  );
}

function CredentialTable({
  rows,
  useAccountLabel = false,
}: {
  rows: Login[];
  useAccountLabel?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* Column headers (desktop only) */}
      <div className="hidden gap-4 px-3 text-xs font-semibold uppercase tracking-wider text-white/40 md:flex">
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
          />
        ))}
      </div>
    </div>
  );
}

function CredentialRow({
  login,
  useAccountLabel,
}: {
  login: Login;
  useAccountLabel: boolean;
}) {
  const serviceLabel = useAccountLabel ? login.account ?? login.service : login.service;
  // Actions are revealed on hover (desktop); always visible on touch (mobile).
  const onHover = "opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100";

  return (
    <div className="group flex flex-col gap-3 border-b border-white/[0.06] px-3 py-3 transition-colors last:border-b-0 hover:bg-accent md:flex-row md:items-center md:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ServiceIcon name={login.service} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {serviceLabel}
          </p>
          {login.note ? (
            <p className="text-xs text-accent-yellow">{login.note}</p>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
        <User className="size-4 shrink-0 md:hidden" aria-hidden />
        <span className="truncate">{login.username}</span>
        <CopyButton value={login.username} label="username" className={onHover} />
      </div>

      <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4 shrink-0 md:hidden" aria-hidden />
        <span className="tracking-widest">•••••••••••</span>
        <CopyButton value={login.password} label="password" className={onHover} />
      </div>

      <div className="shrink-0 md:w-28 md:text-right">
        {login.url ? (
          <a
            href={login.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-surface px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-white",
              onHover
            )}
          >
            Open Site
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        ) : null}
      </div>
    </div>
  );
}
