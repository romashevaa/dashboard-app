export type NavItem = {
  label: string;
  href: string;
  /** Emoji image name in /public/emoji (see EmojiIcon), matching Figma. */
  icon: string;
};

/**
 * Primary navigation for the dashboard. Mirrors the planned feature set
 * (CLAUDE.md → Project) and the Figma sidebar (node 920:7090). Sections are
 * scaffolded as placeholders and filled in feature by feature.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "My Dashboard", href: "/", icon: "palette" },
  { label: "Credentials", href: "/credentials", icon: "lock" },
  { label: "Resources", href: "/resources", icon: "unicorn" },
  { label: "Members", href: "/members", icon: "technologist" },
  { label: "Message templates", href: "/templates", icon: "writing-hand" },
];

/** Admin-only navigation, appended for users with the `admin` role. */
export const ADMIN_NAV_ITEM: NavItem = {
  label: "Admin",
  href: "/admin",
  icon: "shield",
};
