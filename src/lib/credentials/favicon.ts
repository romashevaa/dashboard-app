/** Derives a favicon URL for a website URL (or undefined if it can't parse). */
export function faviconFor(url: string): string | undefined {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
  } catch {
    return undefined;
  }
}
