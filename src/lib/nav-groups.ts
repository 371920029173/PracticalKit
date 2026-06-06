import type { Messages } from "@/lib/messages";
import { TOOLS, type ToolCategory } from "@/lib/tools-registry";

export type NavKey = keyof Messages["nav"];

export type NavGroup = {
  id: ToolCategory | "legal";
  labelKey: keyof Messages["navGroup"];
  links: { href: string; labelKey: NavKey }[];
};

const CATEGORY_ORDER: ToolCategory[] = [
  "documents",
  "media",
  "dataDev",
  "daily",
  "math",
  "network",
  "fun",
  "extras",
];

function linksForCategory(category: ToolCategory) {
  return TOOLS.filter((t) => t.category === category).map((t) => ({
    href: `/${t.segment}/`,
    labelKey: t.navKey,
  }));
}

export const NAV_GROUPS: NavGroup[] = [
  ...CATEGORY_ORDER.map((id) => ({
    id,
    labelKey: id as keyof Messages["navGroup"],
    links: linksForCategory(id),
  })),
  {
    id: "legal",
    labelKey: "legal",
    links: [
      { href: "/about/", labelKey: "about" },
      { href: "/blog/", labelKey: "blog" },
      { href: "/privacy/", labelKey: "privacy" },
      { href: "/terms/", labelKey: "terms" },
      { href: "/disclaimer/", labelKey: "disclaimer" },
      { href: "/contact/", labelKey: "contact" },
    ],
  },
];
