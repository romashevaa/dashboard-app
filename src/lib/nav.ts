import {
  BookOpen,
  CalendarDays,
  KeyRound,
  LayoutDashboard,
  Link2,
  LayoutTemplate,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

/**
 * Primary navigation for the dashboard. Mirrors the planned feature set
 * (CLAUDE.md → Project). Sections are scaffolded as placeholders and filled
 * in feature by feature.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Members", href: "/members", icon: Users },
  { label: "Credentials", href: "/credentials", icon: KeyRound },
  { label: "Resources", href: "/resources", icon: BookOpen },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Events", href: "/events", icon: CalendarDays },
  { label: "Links", href: "/links", icon: Link2 },
];
