import type { Messages } from "@/lib/messages";
import type { ToolEditorialMode } from "@/components/ToolEditorialFooter";

export type NavKey = keyof Messages["nav"];

export type ToolCategory =
  | "documents"
  | "media"
  | "dataDev"
  | "daily"
  | "math"
  | "network"
  | "fun"
  | "extras";

export type ToolDef = {
  segment: string;
  navKey: NavKey;
  category: ToolCategory;
  mode: ToolEditorialMode;
  /** Extra search tokens (English); localized blurbs come from messages. */
  keywords?: string[];
  isNew?: boolean;
};

/** Single source of truth for tool routes, sitemap, search, and nav. */
export const TOOLS: ToolDef[] = [
  { segment: "pdf", navKey: "pdf", category: "documents", mode: "fileMedia", keywords: ["merge", "compress"] },
  { segment: "image", navKey: "image", category: "media", mode: "fileMedia", keywords: ["resize", "convert", "webp"] },
  { segment: "video-gif", navKey: "videoGif", category: "media", mode: "fileMedia" },
  { segment: "audio", navKey: "audio", category: "media", mode: "fileMedia" },
  { segment: "rgbv3d", navKey: "rgbv3d", category: "media", mode: "fileMedia" },
  { segment: "data", navKey: "data", category: "dataDev", mode: "local", keywords: ["json", "xml", "yaml"] },
  { segment: "text", navKey: "text", category: "dataDev", mode: "local" },
  { segment: "markdown", navKey: "markdown", category: "dataDev", mode: "local" },
  { segment: "encoding", navKey: "encoding", category: "dataDev", mode: "local", keywords: ["base64", "url"] },
  { segment: "code", navKey: "code", category: "dataDev", mode: "local" },
  { segment: "regex", navKey: "regex", category: "dataDev", mode: "local" },
  { segment: "text-diff", navKey: "textDiff", category: "dataDev", mode: "local", keywords: ["diff", "compare"] },
  { segment: "base-convert", navKey: "baseConvert", category: "dataDev", mode: "local", keywords: ["binary", "hex"] },
  { segment: "calc", navKey: "calc", category: "math", mode: "local", keywords: ["calculator", "math"] },
  { segment: "function-plot", navKey: "functionPlot", category: "math", mode: "local" },
  { segment: "units", navKey: "units", category: "math", mode: "local" },
  { segment: "time", navKey: "time", category: "daily", mode: "local", keywords: ["timestamp", "unix"] },
  { segment: "money", navKey: "money", category: "daily", mode: "thirdParty", keywords: ["exchange", "currency"] },
  { segment: "translate", navKey: "translate", category: "daily", mode: "thirdParty" },
  { segment: "color", navKey: "color", category: "daily", mode: "local", keywords: ["hex", "rgb", "picker"] },
  { segment: "qr", navKey: "qr", category: "daily", mode: "local", keywords: ["qrcode", "barcode"] },
  { segment: "password", navKey: "password", category: "daily", mode: "local" },
  { segment: "ip-lookup", navKey: "ipLookup", category: "network", mode: "thirdParty", keywords: ["ip", "geo", "location"] },
  { segment: "user-agent", navKey: "userAgent", category: "network", mode: "local", keywords: ["browser", "ua"] },
  { segment: "dns-lookup", navKey: "dnsLookup", category: "network", mode: "thirdParty", keywords: ["dns", "domain", "a record", "mx"] },
  { segment: "mushroom-quiz", navKey: "mushroomQuiz", category: "fun", mode: "local", keywords: ["benchmark", "stress", "performance", "cpu", "gpu"] },
  { segment: "morse", navKey: "morse", category: "fun", mode: "local", keywords: ["morse", "dot dash", "telegraph"] },
  { segment: "bmi", navKey: "bmiCalc", category: "daily", mode: "local", keywords: ["bmi", "body mass", "weight"] },
  { segment: "percent", navKey: "percentCalc", category: "math", mode: "local", keywords: ["percentage", "percent", "ratio"] },
  { segment: "url-parser", navKey: "urlParser", category: "dataDev", mode: "local", keywords: ["url", "parse", "query string", "hostname"] },
  { segment: "password-audit", navKey: "passwordAudit", category: "daily", mode: "local", keywords: ["password", "strength", "entropy"], isNew: true },
  { segment: "timezone", navKey: "timezone", category: "daily", mode: "local", keywords: ["timezone", "utc", "convert"], isNew: true },
  { segment: "luhn", navKey: "luhnCheck", category: "extras", mode: "local", keywords: ["luhn", "credit card", "validate"], isNew: true },
  { segment: "roman", navKey: "romanNumeral", category: "math", mode: "local", keywords: ["roman", "numeral", "IV"], isNew: true },
  { segment: "countdown", navKey: "countdown", category: "daily", mode: "local", keywords: ["timer", "countdown", "stopwatch"], isNew: true },
  { segment: "hash", navKey: "hash", category: "extras", mode: "local", keywords: ["sha", "digest"] },
  { segment: "jwt", navKey: "jwt", category: "extras", mode: "local" },
  { segment: "cron", navKey: "cron", category: "extras", mode: "local" },
  { segment: "http-status", navKey: "httpStatus", category: "extras", mode: "local" },
  { segment: "api-snippet", navKey: "apiSnippet", category: "extras", mode: "local", keywords: ["curl", "fetch"] },
  { segment: "csv-json", navKey: "csvJson", category: "extras", mode: "local" },
  { segment: "slug", navKey: "slug", category: "extras", mode: "local" },
  { segment: "html-entities", navKey: "htmlEntities", category: "extras", mode: "local" },
  { segment: "css-min", navKey: "cssMin", category: "extras", mode: "local" },
  { segment: "lorem", navKey: "lorem", category: "extras", mode: "local" },
  { segment: "unicode", navKey: "unicode", category: "extras", mode: "local" },
  { segment: "cidr", navKey: "cidr", category: "extras", mode: "local", keywords: ["subnet", "network"] },
  { segment: "random", navKey: "random", category: "extras", mode: "local", keywords: ["uuid", "dice"] },
  { segment: "json-diff", navKey: "jsonDiff", category: "extras", mode: "local" },
];

export const TOOL_SEGMENTS = TOOLS.map((t) => t.segment);

export const TOOL_SEGMENT_TO_NAV: Record<string, NavKey> = Object.fromEntries(
  TOOLS.map((t) => [t.segment, t.navKey]),
) as Record<string, NavKey>;

export const STATIC_PAGE_ROUTES = [
  "privacy",
  "terms",
  "disclaimer",
  "about",
  "blog",
  "contact",
] as const;

export const SITEMAP_LOCALES = ["en", "zh", "ru", "es", "fr"] as const;

export function segmentFromNavKey(navKey: string): string {
  const found = TOOLS.find((t) => t.navKey === navKey);
  return found?.segment ?? navKey.toLowerCase();
}

export function toolBySegment(segment: string): ToolDef | undefined {
  return TOOLS.find((t) => t.segment === segment);
}

export function toolsByCategory(category: ToolCategory | "all"): ToolDef[] {
  if (category === "all") return TOOLS;
  return TOOLS.filter((t) => t.category === category);
}
