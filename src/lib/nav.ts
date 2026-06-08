export type NavItem = {
  label: string;
  href: string;
  /** Emoji glyph used as the nav icon, matching the Figma sidebar. */
  emoji: string;
};

/**
 * Primary navigation for the dashboard. Mirrors the planned feature set
 * (CLAUDE.md → Project) and the Figma sidebar (node 920:7090). Sections are
 * scaffolded as placeholders and filled in feature by feature.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "My Dashboard", href: "/", emoji: "🎨" },
  { label: "Credentials", href: "/credentials", emoji: "🔐" },
  { label: "Resources", href: "/resources", emoji: "🦄" },
  { label: "Members", href: "/members", emoji: "👩🏼‍💻" },
  { label: "Templates", href: "/templates", emoji: "✍️" },
  { label: "Events", href: "/events", emoji: "📆" },
  { label: "Links", href: "/links", emoji: "🔗" },
];

/** Admin-only navigation, appended for users with the `admin` role. */
export const ADMIN_NAV_ITEM: NavItem = {
  label: "Admin",
  href: "/admin",
  emoji: "🛡️",
};
