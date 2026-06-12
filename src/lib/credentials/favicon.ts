/** Derives a favicon URL for a website URL (or undefined if it can't parse). */
export function faviconFor(url: string): string | undefined {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return undefined;
  }
}

/**
 * Guesses a service name from a URL's domain — e.g. "https://app.webflow.com"
 * → "Webflow", "ui8.net" → "Ui8". A starting point the user can edit; avoids a
 * network round-trip to read the page <title> (which CORS would block anyway).
 */
export function serviceNameFromUrl(url: string): string | undefined {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const host = u.hostname.replace(/^www\./, "");
    const parts = host.split(".");
    // Second-to-last label is the registrable name for the common cases.
    const name = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    if (!name) return undefined;
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return undefined;
  }
}

