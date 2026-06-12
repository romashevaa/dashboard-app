"use server";

import { revalidatePath } from "next/cache";

import { getCurrentProfile, requireAdmin } from "@/lib/auth/profile";
import { createClient } from "@/lib/supabase/server";
import { faviconFor } from "@/lib/credentials/favicon";
import type { Database } from "@/lib/db/database.types";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type CredentialInput = {
  service: string;
  account?: string | null;
  username: string;
  password?: string | null;
  url?: string | null;
  noIcon: boolean;
  note?: string | null;
};

export type ActionResult = { ok?: true; error?: string };

function clean(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed.length ? trimmed : null;
}

/**
 * Finds a service by name (case-insensitive) and upserts its display fields,
 * or creates it. Returns the service id. Writes never touch credential values.
 */
async function resolveService(
  supabase: SupabaseClient,
  input: CredentialInput
): Promise<{ id: string } | { error: string }> {
  const name = input.service.trim();
  const url = clean(input.url);
  const iconUrl = input.noIcon ? null : url ? (faviconFor(url) ?? null) : null;

  const { data: candidates } = await supabase
    .from("services")
    .select("id, name")
    .ilike("name", name);
  const existing = candidates?.find(
    (s) => s.name.toLowerCase() === name.toLowerCase()
  );

  // Note: category_note is deliberately NOT touched here — it's managed in
  // one place, at the service heading (see updateServiceNote), so saving an
  // individual login can never clobber the service-level note.
  if (existing) {
    // Only overwrite the service's display fields with values the form
    // actually provided. A blank URL on a later login must NOT wipe the
    // service's url/icon for the whole group; clearing the icon is done
    // explicitly via the "use a letter" checkbox.
    const update: Database["public"]["Tables"]["services"]["Update"] = {
      name,
    };
    if (input.noIcon) {
      update.no_icon = true;
      update.icon_url = null;
    }
    if (url) {
      update.url = url;
      if (!input.noIcon) {
        update.no_icon = false;
        update.icon_url = iconUrl;
      }
    }

    const { error } = await supabase
      .from("services")
      .update(update)
      .eq("id", existing.id);
    if (error) {
      console.error("[credentials] update service failed:", error);
      return { error: `Couldn't save the service: ${error.message}` };
    }
    return { id: existing.id };
  }

  // New services append at the end of the manual order.
  const { data: lastService } = await supabase
    .from("services")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from("services")
    .insert({
      name,
      url,
      icon_url: iconUrl,
      no_icon: input.noIcon,
      sort_order: (lastService?.sort_order ?? 0) + 1,
    })
    .select("id")
    .single();
  if (error || !created) {
    console.error("[credentials] create service failed:", error);
    return {
      error: error
        ? `Couldn't create the service: ${error.message}`
        : "Couldn't create the service.",
    };
  }
  return { id: created.id };
}

/** Deletes a service when it no longer has any credentials (tidy-up). */
async function pruneOrphanService(supabase: SupabaseClient, serviceId: string) {
  const { count } = await supabase
    .from("credentials")
    .select("id", { count: "exact", head: true })
    .eq("service_id", serviceId);
  if ((count ?? 0) === 0) {
    await supabase.from("services").delete().eq("id", serviceId);
  }
}

function validate(input: CredentialInput): string | null {
  if (!input.service.trim()) return "A service name is required.";
  // Password is optional (some services are email-only); a login is required.
  if (!input.username.trim()) return "A username or login is required.";
  return null;
}

export async function createCredential(
  input: CredentialInput
): Promise<ActionResult> {
  await requireAdmin();
  const invalid = validate(input);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const service = await resolveService(supabase, input);
  if ("error" in service) return { error: service.error };

  // New logins append at the end of their service's manual order.
  const { data: lastRow } = await supabase
    .from("credentials")
    .select("sort_order")
    .eq("service_id", service.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: created, error } = await supabase
    .from("credentials")
    .insert({
      service_id: service.id,
      account: clean(input.account),
      username: input.username.trim(),
      password: clean(input.password),
      note: clean(input.note),
      sort_order: (lastRow?.sort_order ?? 0) + 1,
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("[credentials] create credential failed:", error);
    return {
      error: error
        ? `Couldn't add the credential: ${error.message}`
        : "Couldn't add the credential.",
    };
  }

  // Audit: identifiers only — never the username/password values.
  await supabase.rpc("record_audit_event", {
    p_action: "create",
    p_entity_type: "credential",
    p_entity_id: created.id,
    p_metadata: { service: input.service.trim(), account: clean(input.account) },
  });

  revalidatePath("/credentials");
  return { ok: true };
}

export async function updateCredential(
  id: string,
  input: CredentialInput
): Promise<ActionResult> {
  await requireAdmin();
  const invalid = validate(input);
  if (invalid) return { error: invalid };

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("credentials")
    .select(
      "service_id, account, username, password, note, service:services(name, url, no_icon, category_note)"
    )
    .eq("id", id)
    .single();
  if (!before) return { error: "That credential no longer exists." };

  const service = await resolveService(supabase, input);
  if ("error" in service) return { error: service.error };

  // Moving to a different service → append at the end of that service's order.
  let sortOrder: number | undefined;
  if (before.service_id !== service.id) {
    const { data: lastRow } = await supabase
      .from("credentials")
      .select("sort_order")
      .eq("service_id", service.id)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    sortOrder = (lastRow?.sort_order ?? 0) + 1;
  }

  const { error } = await supabase
    .from("credentials")
    .update({
      service_id: service.id,
      account: clean(input.account),
      username: input.username.trim(),
      password: clean(input.password),
      note: clean(input.note),
      ...(sortOrder !== undefined ? { sort_order: sortOrder } : {}),
    })
    .eq("id", id);
  if (error) return { error: "Couldn't save your changes." };

  // The service may have been renamed — drop the old one if now empty.
  if (before.service_id !== service.id) {
    await pruneOrphanService(supabase, before.service_id);
  }

  // Audit: record which fields changed by NAME only (never values).
  const beforeService = Array.isArray(before.service)
    ? before.service[0]
    : before.service;
  const changed: string[] = [];
  if (clean(before.account) !== clean(input.account)) changed.push("account");
  if (before.username !== input.username.trim()) changed.push("username");
  if (clean(before.password) !== clean(input.password)) changed.push("password");
  if (clean(before.note) !== clean(input.note)) changed.push("note");
  if ((beforeService?.name ?? "") !== input.service.trim())
    changed.push("service");

  await supabase.rpc("record_audit_event", {
    p_action: "update",
    p_entity_type: "credential",
    p_entity_id: id,
    p_metadata: {
      service: input.service.trim(),
      account: clean(input.account),
      fields: changed,
    },
  });

  revalidatePath("/credentials");
  return { ok: true };
}

export async function deleteCredential(id: string): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("credentials")
    .select("service_id, account, service:services(name)")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("credentials").delete().eq("id", id);
  if (error) return { error: "Couldn't remove the credential." };

  if (before) {
    await pruneOrphanService(supabase, before.service_id);
    const svc = Array.isArray(before.service)
      ? before.service[0]
      : before.service;
    await supabase.rpc("record_audit_event", {
      p_action: "delete",
      p_entity_type: "credential",
      p_entity_id: id,
      p_metadata: { service: svc?.name ?? null, account: before.account },
    });
  }

  revalidatePath("/credentials");
  return { ok: true };
}

/**
 * Sets (or clears, with an empty string) a service's category note — the
 * yellow note under a grouped service's heading. This is the ONLY place the
 * note is written, so it can't be clobbered from individual logins.
 */
export async function updateServiceNote(
  serviceId: string,
  note: string
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { data: updated, error } = await supabase
    .from("services")
    .update({ category_note: clean(note) })
    .eq("id", serviceId)
    .select("name")
    .single();

  if (error || !updated) {
    console.error("[credentials] update service note failed:", error);
    return { error: "Couldn't save the note." };
  }

  await supabase.rpc("record_audit_event", {
    p_action: "update",
    p_entity_type: "service",
    p_entity_id: serviceId,
    p_metadata: { service: updated.name, fields: ["category_note"] },
  });

  revalidatePath("/credentials");
  return { ok: true };
}

/**
 * Persists a new manual order for the logins of one service. `orderedIds` is
 * the full id list in the desired order; each row's sort_order becomes its
 * index. Scoped to the service so ids can't reorder other services' rows.
 */
export async function reorderCredentials(
  serviceId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase
      .from("credentials")
      .update({ sort_order: index + 1 })
      .eq("id", id)
      .eq("service_id", serviceId);
    if (error) {
      console.error("[credentials] reorder failed:", error);
      return { error: "Couldn't save the new order." };
    }
  }

  await supabase.rpc("record_audit_event", {
    p_action: "reorder",
    p_entity_type: "service",
    p_entity_id: serviceId,
    p_metadata: { scope: "credentials", count: orderedIds.length },
  });

  revalidatePath("/credentials");
  return { ok: true };
}

/**
 * Persists a new manual order for services (group order on the page, and the
 * order of singles in "All logins").
 */
export async function reorderServices(
  orderedIds: string[]
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  for (const [index, id] of orderedIds.entries()) {
    const { error } = await supabase
      .from("services")
      .update({ sort_order: index + 1 })
      .eq("id", id);
    if (error) {
      console.error("[credentials] reorder services failed:", error);
      return { error: "Couldn't save the new order." };
    }
  }

  await supabase.rpc("record_audit_event", {
    p_action: "reorder",
    p_entity_type: "service",
    p_entity_id: null,
    p_metadata: { scope: "services", count: orderedIds.length },
  });

  revalidatePath("/credentials");
  return { ok: true };
}

/**
 * Records that a credential's password was revealed/copied. Any signed-in user
 * may do this (visibility is open). Logs identifiers only — never the value.
 */
export async function logCredentialReveal(id: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile) return;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("credentials")
    .select("account, service:services(name)")
    .eq("id", id)
    .single();

  const svc = Array.isArray(row?.service) ? row?.service[0] : row?.service;
  await supabase.rpc("record_audit_event", {
    p_action: "reveal",
    p_entity_type: "credential",
    p_entity_id: id,
    p_metadata: {
      service: svc?.name ?? null,
      account: row?.account ?? null,
      field: "password",
    },
  });
}
