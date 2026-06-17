import "server-only";

const SLACK_API = "https://slack.com/api";

/** Whether the Slack bot token is configured (gates the import UI). */
export function isSlackConfigured(): boolean {
  return Boolean(process.env.SLACK_BOT_TOKEN);
}

/** The subset of a Slack user's profile we map into our profile fields. */
export type SlackProfile = {
  first_name?: string;
  last_name?: string;
  real_name?: string;
  display_name?: string;
  title?: string;
  phone?: string;
  image_512?: string;
  image_192?: string;
};

type LookupResult =
  | { ok: true; profile: SlackProfile }
  | { ok: false; error: string };

/**
 * Looks up a workspace member by email via Slack's Web API. Uses the bot token
 * (server-only); requires the `users:read.email` + `users.profile:read` scopes.
 */
export async function lookupSlackUserByEmail(
  email: string
): Promise<LookupResult> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return { ok: false, error: "not_configured" };

  try {
    const res = await fetch(
      `${SLACK_API}/users.lookupByEmail?email=${encodeURIComponent(email)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    const data = (await res.json()) as {
      ok: boolean;
      error?: string;
      user?: { profile?: SlackProfile };
    };
    if (!data.ok) return { ok: false, error: data.error ?? "slack_error" };
    return { ok: true, profile: data.user?.profile ?? {} };
  } catch (err) {
    console.error("[slack] lookup failed:", err);
    return { ok: false, error: "network_error" };
  }
}
