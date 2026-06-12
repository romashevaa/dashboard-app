"use client";

import { useEffect, useId, useMemo, useRef, useState, useTransition } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  GripVertical,
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
  reorderCredentials,
  reorderServices,
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
  /** Optional — some services are entered with just an email/login. */
  password?: string;
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
    password: record.password ?? undefined,
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
    password: draft.password ?? null,
    url: draft.url ?? null,
    noIcon: draft.noIcon ?? false,
    note: draft.note ?? null,
  };
}

/**
 * Sentinel section key for the "All logins" section. The leading space can't
 * collide with a real service name (those are trimmed on save).
 */
const SINGLES_SECTION = " all-logins";

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

  // Local copy of the server order so drags feel instant; re-synced whenever
  // the server revalidates (and on error rollback). Synced during render per
  // React's "adjusting state when props change" pattern.
  const [ordered, setOrdered] = useState<CredentialRecord[]>(records);
  const [prevRecords, setPrevRecords] = useState(records);
  if (prevRecords !== records) {
    setPrevRecords(records);
    setOrdered(records);
  }

  const logins = useMemo(() => ordered.map(toLogin), [ordered]);

  // Service-level notes + ids, derived from the records (one per service).
  const services = useMemo(() => {
    const byName: Record<string, { id: string; note: string | null }> = {};
    for (const r of ordered) {
      byName[r.service] = { id: r.serviceId, note: r.categoryNote };
    }
    return byName;
  }, [ordered]);

  // All service names in their current page-wide order (groups + singles).
  const orderedServiceNames = useMemo(
    () => [...new Set(ordered.map((r) => r.service))],
    [ordered]
  );

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

  // Display fields per existing service, so the modal can prefill the URL and
  // icon choice when a new login joins an existing service.
  const serviceDetails = useMemo(() => {
    const byName: Record<string, { url?: string; noIcon?: boolean }> = {};
    for (const r of ordered) {
      byName[r.service.toLowerCase()] = {
        url: r.url ?? undefined,
        noIcon: r.noIcon,
      };
    }
    return byName;
  }, [ordered]);

  // Visible sections in page order: each group is a section keyed by its
  // service name; the "All logins" block is one section anchored where its
  // first single sits in the page-wide service order.
  const sections = useMemo(() => {
    const groupSet = new Set(groups.map(([name]) => name));
    const singleSet = new Set(singles.map((l) => l.service));
    const keys: string[] = [];
    for (const name of orderedServiceNames) {
      if (groupSet.has(name)) keys.push(name);
      else if (singleSet.has(name) && !keys.includes(SINGLES_SECTION))
        keys.push(SINGLES_SECTION);
    }
    return keys;
  }, [groups, singles, orderedServiceNames]);

  const remove = (id: string) => {
    setError(null);
    setDeletingId(id);
    startTransition(async () => {
      const result = await deleteCredential(id);
      if (result.error) setError(result.error);
      setDeletingId(null);
    });
  };

  // Reordering is admin-only and disabled while searching (a filtered list
  // has no meaningful "position").
  const canReorder = isAdmin && !query.trim();

  /** Drag within one service group: persist the new login order. */
  const reorderRows = (service: string, activeId: string, overId: string) => {
    const serviceId = services[service]?.id;
    if (!serviceId) return;

    const current = ordered.filter((r) => r.service === service);
    const ids = current.map((r) => r.id);
    const from = ids.indexOf(activeId);
    const to = ids.indexOf(overId);
    if (from < 0 || to < 0 || from === to) return;

    const newIds = arrayMove(ids, from, to);
    const byId = new Map(current.map((r) => [r.id, r]));
    let next = 0;
    setOrdered(
      ordered.map((r) =>
        r.service === service ? (byId.get(newIds[next++]) ?? r) : r
      )
    );

    setError(null);
    startTransition(async () => {
      const result = await reorderCredentials(serviceId, newIds);
      if (result.error) {
        setError(result.error);
        setOrdered(records);
      }
    });
  };

  /** Applies a new page-wide service order (optimistic) and persists it. */
  const applyServiceOrder = (namesInOrder: string[]) => {
    const byService = new Map<string, CredentialRecord[]>();
    for (const r of ordered) {
      const list = byService.get(r.service);
      if (list) list.push(r);
      else byService.set(r.service, [r]);
    }
    setOrdered(namesInOrder.flatMap((name) => byService.get(name) ?? []));

    const idsInOrder = namesInOrder
      .map((name) => services[name]?.id)
      .filter((id): id is string => Boolean(id));

    setError(null);
    startTransition(async () => {
      const result = await reorderServices(idsInOrder);
      if (result.error) {
        setError(result.error);
        setOrdered(records);
      }
    });
  };

  /**
   * Move a whole section (a service group, or the "All logins" block) up or
   * down the page. Rebuilds the page-wide service order from the new section
   * order — which also keeps the singles contiguous.
   */
  const moveSection = (key: string, direction: -1 | 1) => {
    const from = sections.indexOf(key);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= sections.length) return;

    const newSections = arrayMove(sections, from, to);
    const singleNames = singles.map((l) => l.service);
    applyServiceOrder(
      newSections.flatMap((k) => (k === SINGLES_SECTION ? singleNames : [k]))
    );
  };

  /** Drag within "All logins": reorder those services among themselves. */
  const reorderSingles = (activeId: string, overId: string) => {
    const ids = singles.map((l) => l.id);
    const from = ids.indexOf(activeId);
    const to = ids.indexOf(overId);
    if (from < 0 || to < 0 || from === to) return;

    const newSingles = arrayMove(singles, from, to);
    // Reassign the singles' services into their existing slots of the
    // page-wide order, leaving grouped services where they are.
    const singleServices = new Set(singles.map((l) => l.service));
    let next = 0;
    const full = orderedServiceNames.map((name) =>
      singleServices.has(name) ? newSingles[next++].service : name
    );
    applyServiceOrder(full);
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
    <div className="@container flex flex-col gap-8">
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
            className="min-w-0 flex-1 bg-transparent text-base text-foreground outline-none placeholder:text-white/40 md:text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
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

      {sections.map((sectionKey, sectionIndex) => {
        const mover =
          canReorder && sections.length > 1 ? (
            <SectionMover
              label={
                sectionKey === SINGLES_SECTION ? "All logins" : sectionKey
              }
              isFirst={sectionIndex === 0}
              isLast={sectionIndex === sections.length - 1}
              onMove={(direction) => moveSection(sectionKey, direction)}
            />
          ) : null;

        if (sectionKey === SINGLES_SECTION) {
          return (
            <section key={sectionKey} className="flex flex-col gap-4">
              <div className="group/head flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">
                  All logins
                </h2>
                {mover}
              </div>
              <CredentialTable
                rows={singles}
                isAdmin={isAdmin}
                deletingId={deletingId}
                onRemove={remove}
                onEdit={setEditing}
                onReorder={
                  canReorder && singles.length > 1 ? reorderSingles : undefined
                }
              />
            </section>
          );
        }

        const service = sectionKey;
        const rows = groups.find(([name]) => name === service)?.[1] ?? [];
        const head = rows.find((r) => r.iconUrl) ?? rows[0];
        return (
          <section key={service} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="group/head flex items-center gap-2.5">
                <ServiceAvatar
                  name={service}
                  iconUrl={head?.iconUrl}
                  noIcon={head?.noIcon}
                />
                <h2 className="text-lg font-semibold tracking-tight">{service}</h2>
                {mover}
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
              onReorder={
                canReorder && rows.length > 1
                  ? (activeId, overId) => reorderRows(service, activeId, overId)
                  : undefined
              }
            />
          </section>
        );
      })}

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
          serviceDetails={serviceDetails}
          initial={editing === "new" ? undefined : editing}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}

/**
 * Up/down controls next to a section heading (service group or "All logins"),
 * revealed on hover at lg+. The parent heading row must carry `group/head`.
 */
function SectionMover({
  label,
  isFirst,
  isLast,
  onMove,
}: {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
}) {
  const buttonClass =
    "rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-30";
  return (
    <span className="ml-1 flex items-center gap-0.5 opacity-100 transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover/head:opacity-100 pointer-fine:group-focus-within/head:opacity-100">
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={isFirst}
        aria-label={`Move ${label} up`}
        className={buttonClass}
      >
        <ChevronUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={isLast}
        aria-label={`Move ${label} down`}
        className={buttonClass}
      >
        <ChevronDown className="size-4" aria-hidden />
      </button>
    </span>
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
        className="shrink-0 rounded text-muted-foreground opacity-100 outline-none transition-opacity hover:text-white focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/60 pointer-fine:opacity-0 pointer-fine:group-hover/note:opacity-100"
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
  onReorder,
}: {
  rows: Login[];
  useAccountLabel?: boolean;
  isAdmin?: boolean;
  deletingId: string | null;
  onRemove: (id: string) => void;
  onEdit: (login: Login) => void;
  /** Present → rows are drag-sortable (admin, not searching). */
  onReorder?: (activeId: string, overId: string) => void;
}) {
  const sensors = useSensors(
    // The small distance keeps plain clicks (copy, links) from starting drags.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const sortable = Boolean(onReorder);
  // Stable id for DndContext: its internal counter-based id differs between
  // server and client renders and causes a hydration mismatch.
  const dndId = useId();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder?.(String(active.id), String(over.id));
    }
  };

  const body = (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-background">
      {rows.map((login) => (
        <CredentialRow
          key={login.id}
          login={login}
          useAccountLabel={useAccountLabel}
          isAdmin={isAdmin}
          deleting={deletingId === login.id}
          sortable={sortable}
          onRemove={onRemove}
          onEdit={onEdit}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Column headers — only the wide (lg) table layout uses them. */}
      <div className="hidden gap-4 px-3 text-xs font-semibold uppercase tracking-wider text-white/40 @2xl:flex">
        <span className="flex-1">Service</span>
        <span className="flex flex-1 items-center gap-1.5">
          <User className="size-4" aria-hidden /> Username / login
        </span>
        <span className="flex flex-1 items-center gap-1.5">
          <Lock className="size-4" aria-hidden /> Password
        </span>
        {isAdmin ? <span className="w-20 shrink-0" /> : null}
      </div>

      {sortable ? (
        <DndContext
          id={dndId}
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={rows.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            {body}
          </SortableContext>
        </DndContext>
      ) : (
        body
      )}
    </div>
  );
}

function CredentialRow({
  login,
  useAccountLabel,
  isAdmin,
  deleting,
  sortable,
  onRemove,
  onEdit,
}: {
  login: Login;
  useAccountLabel: boolean;
  isAdmin: boolean;
  deleting: boolean;
  sortable: boolean;
  onRemove: (id: string) => void;
  onEdit: (login: Login) => void;
}) {
  // Deleting is destructive and immediate — require a second click to confirm.
  const [confirming, setConfirming] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: login.id, disabled: !sortable });
  const serviceLabel = useAccountLabel ? login.account ?? login.service : login.service;
  // Below lg the rows stack into cards (actions always visible); at lg they
  // become table columns where actions reveal on hover or keyboard focus.
  const reveal =
    "opacity-100 transition-opacity pointer-fine:opacity-0 pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:opacity-100";

  const serviceInner = (
    <>
      <ServiceAvatar
        name={login.service}
        iconUrl={login.iconUrl}
        noIcon={login.noIcon}
        className="mt-0.5"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="flex items-center gap-1 text-sm font-semibold text-foreground">
          <span className="truncate">{serviceLabel}</span>
          {!useAccountLabel && login.account ? (
            // Singles render under the service name, so surface the account
            // label here — otherwise the field would look like it does nothing.
            <span className="truncate text-xs font-normal text-muted-foreground">
              · {login.account}
            </span>
          ) : null}
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
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      onMouseLeave={() => setConfirming(false)}
      className={cn(
        "group flex flex-col gap-3 border-b border-white/[0.06] px-4 py-4 transition-colors last:border-b-0 hover:bg-accent focus-within:bg-accent @2xl:flex-row @2xl:items-center @2xl:gap-4 @2xl:px-3 @2xl:py-3",
        deleting && "pointer-events-none opacity-40",
        isDragging && "relative z-10 border-b-transparent bg-accent shadow-lg"
      )}
    >
      {login.url ? (
        <a
          href={login.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${serviceLabel}`}
          className="flex min-w-0 flex-1 items-start gap-3 rounded outline-none transition-colors hover:[&_p]:text-white focus-visible:ring-2 focus-visible:ring-ring/60"
        >
          {serviceInner}
        </a>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-3">{serviceInner}</div>
      )}

      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
        <User className="size-4 shrink-0 @2xl:hidden" aria-hidden />
        <CopyText value={login.username} label="username" iconClassName={reveal} />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground">
        <Lock className="size-4 shrink-0 @2xl:hidden" aria-hidden />
        <PasswordCell login={login} revealClass={reveal} />
      </div>

      {isAdmin ? (
        <div className="flex shrink-0 items-center justify-end gap-3 @2xl:w-20">
          {sortable ? (
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={`Reorder ${serviceLabel}`}
              className={cn(
                "shrink-0 cursor-grab touch-none rounded text-muted-foreground outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-ring/60 active:cursor-grabbing",
                reveal
              )}
            >
              <GripVertical className="size-4" aria-hidden />
            </button>
          ) : null}
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

  // Email-only logins have no password to show.
  if (!login.password) {
    return (
      <span className="text-muted-foreground/50" aria-label="No password">
        —
      </span>
    );
  }

  const toggle = () => {
    // The audit call must stay outside the setState updater — updaters have
    // to be pure (React may re-run them during render).
    const next = !shown;
    setShown(next);
    if (next) void logCredentialReveal(login.id);
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
