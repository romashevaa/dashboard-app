"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { MemberCard, type Member } from "./member-card";

function matches(member: Member, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [member.full_name, member.email, member.position].some((v) =>
    v?.toLowerCase().includes(q)
  );
}

export function MembersDirectory({ members }: { members: Member[] }) {
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // ⌘F / Ctrl+F focuses the search instead of the browser's find.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = useMemo(
    () => members.filter((m) => matches(m, query)),
    [members, query]
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex h-12 w-full items-center gap-2 rounded-lg border border-input bg-background px-4 transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <input
          ref={searchRef}
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setQuery("");
              e.currentTarget.blur();
            }
          }}
          placeholder="Search by member…"
          aria-label="Search members"
          className="min-w-0 flex-1 appearance-none bg-transparent text-base text-foreground outline-none placeholder:text-white/40 md:text-sm"
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
          <div aria-hidden className="hidden shrink-0 items-center gap-1 sm:flex">
            <kbd className="rounded border border-white/[0.12] bg-surface px-1.5 py-0.5 text-xs text-muted-foreground">
              ⌘
            </kbd>
            <kbd className="rounded border border-white/[0.12] bg-surface px-1.5 py-0.5 text-xs text-muted-foreground">
              F
            </kbd>
          </div>
        )}
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {filtered.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center text-sm text-muted-foreground">
          {query
            ? `No members match “${query}”.`
            : "No one has signed in yet."}
        </p>
      )}
    </div>
  );
}
