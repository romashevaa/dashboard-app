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
  password: string;
  url: string | null;
  iconUrl: string | null;
  noIcon: boolean;
  note: string | null;
  categoryNote: string | null;
};

/**
 * Loads every credential the signed-in user may see (RLS gates this — open to
 * all authenticated users for now), joined to its service. Sorted by service
 * name, then account/username for stable grouping in the UI.
 */
export async function getCredentials(): Promise<CredentialRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("credentials")
    .select(
      "id, account, username, password, note, service:services(id, name, url, icon_url, no_icon, category_note)"
    )
    .order("username", { ascending: true });

  if (error || !data) return [];

  const records: CredentialRecord[] = data.map((row) => {
    // The embedded relation comes back as an object (or, defensively, an array).
    const service = Array.isArray(row.service) ? row.service[0] : row.service;
    return {
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
    };
  });

  return records.sort(
    (a, b) =>
      a.service.localeCompare(b.service) ||
      (a.account ?? a.username).localeCompare(b.account ?? b.username)
  );
}
