import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * A single login flattened with its service's display fields, shaped for the
 * Credentials UI. `categoryNote` is the service-level note (repeated on each
 * row of the service so the client can build its per-service map cheaply).
 */
export type CredentialRecord = {
  id: string;
  serviceId: string;
  service: string;
  account: string | null;
  username: string;
  password: string | null;
  url: string | null;
  iconUrl: string | null;
  noIcon: boolean;
  note: string | null;
  categoryNote: string | null;
};

/**
 * Loads every credential the signed-in user may see (RLS gates this — open to
 * all authenticated users for now), joined to its service. Ordered by the
 * admin-managed sort: services first (group order), then logins within each
 * service. PostgREST can't order a parent by an embedded column, so the sort
 * happens here.
 */
export async function getCredentials(): Promise<CredentialRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credentials")
    .select(
      "id, account, username, password, note, sort_order, service:services(id, name, url, icon_url, no_icon, category_note, sort_order)"
    );

  if (error || !data) return [];

  const rows = data.map((row) => {
    // The embedded relation comes back as an object (or, defensively, an array).
    const service = Array.isArray(row.service) ? row.service[0] : row.service;
    return {
      record: {
        id: row.id,
        serviceId: service?.id ?? "",
        service: service?.name ?? "Unknown",
        account: row.account,
        username: row.username,
        password: row.password,
        url: service?.url ?? null,
        iconUrl: service?.icon_url ?? null,
        noIcon: service?.no_icon ?? false,
        note: row.note,
        categoryNote: service?.category_note ?? null,
      } satisfies CredentialRecord,
      serviceSort: service?.sort_order ?? 0,
      rowSort: row.sort_order,
    };
  });

  return rows
    .sort(
      (a, b) =>
        a.serviceSort - b.serviceSort ||
        a.record.service.localeCompare(b.record.service) ||
        a.rowSort - b.rowSort
    )
    .map((r) => r.record);
}
