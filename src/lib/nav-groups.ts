import type { Messages } from "@/lib/messages";

export type NavKey = keyof Messages["nav"];

export type NavGroup = {
  id: "documents" | "media" | "dataDev" | "daily" | "math" | "extras" | "legal";
  labelKey: keyof Messages["navGroup"];
  links: { href: string; labelKey: NavKey }[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "documents",
    labelKey: "documents",
    links: [{ href: "/pdf/", labelKey: "pdf" }],
  },
  {
    id: "media",
    labelKey: "media",
    links: [
      { href: "/image/", labelKey: "image" },
      { href: "/video-gif/", labelKey: "videoGif" },
      { href: "/audio/", labelKey: "audio" },
      { href: "/rgbv3d/", labelKey: "rgbv3d" },
    ],
  },
  {
    id: "dataDev",
    labelKey: "dataDev",
    links: [
      { href: "/data/", labelKey: "data" },
      { href: "/text/", labelKey: "text" },
      { href: "/markdown/", labelKey: "markdown" },
      { href: "/encoding/", labelKey: "encoding" },
      { href: "/code/", labelKey: "code" },
      { href: "/regex/", labelKey: "regex" },
      { href: "/calc/", labelKey: "calc" },
      { href: "/random/", labelKey: "random" },
      { href: "/json-diff/", labelKey: "jsonDiff" },
    ],
  },
  {
    id: "math",
    labelKey: "math",
    links: [
      { href: "/function-plot/", labelKey: "functionPlot" },
      { href: "/calc/", labelKey: "calc" },
      { href: "/units/", labelKey: "units" },
    ],
  },
  {
    id: "extras",
    labelKey: "extras",
    links: [
      { href: "/hash/", labelKey: "hash" },
      { href: "/jwt/", labelKey: "jwt" },
      { href: "/cron/", labelKey: "cron" },
      { href: "/http-status/", labelKey: "httpStatus" },
      { href: "/api-snippet/", labelKey: "apiSnippet" },
      { href: "/csv-json/", labelKey: "csvJson" },
      { href: "/slug/", labelKey: "slug" },
      { href: "/html-entities/", labelKey: "htmlEntities" },
      { href: "/css-min/", labelKey: "cssMin" },
      { href: "/lorem/", labelKey: "lorem" },
      { href: "/unicode/", labelKey: "unicode" },
      { href: "/cidr/", labelKey: "cidr" },
    ],
  },
  {
    id: "daily",
    labelKey: "daily",
    links: [
      { href: "/time/", labelKey: "time" },
      { href: "/money/", labelKey: "money" },
      { href: "/translate/", labelKey: "translate" },
      { href: "/color/", labelKey: "color" },
      { href: "/qr/", labelKey: "qr" },
      { href: "/password/", labelKey: "password" },
    ],
  },
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
