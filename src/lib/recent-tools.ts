/** First path segment (no locale) → next-intl nav key for `nav(...)`. */
export const TOOL_SEGMENT_TO_NAV: Record<string, string> = {
  blog: "blog",
  pdf: "pdf",
  image: "image",
  data: "data",
  text: "text",
  qr: "qr",
  units: "units",
  time: "time",
  "function-plot": "functionPlot",
  calc: "calc",
  encoding: "encoding",
  password: "password",
  translate: "translate",
  code: "code",
  money: "money",
  markdown: "markdown",
  random: "random",
  "json-diff": "jsonDiff",
  hash: "hash",
  jwt: "jwt",
  cron: "cron",
  "http-status": "httpStatus",
  "api-snippet": "apiSnippet",
  "csv-json": "csvJson",
  slug: "slug",
  "html-entities": "htmlEntities",
  "css-min": "cssMin",
  lorem: "lorem",
  unicode: "unicode",
  cidr: "cidr",
  color: "color",
  "video-gif": "videoGif",
  audio: "audio",
  regex: "regex",
  rgbv3d: "rgbv3d",
};

export type RecentToolEntry = {
  segment: string;
  navKey: string;
  at: number;
};

export const RECENT_TOOLS_KEY = "pk-recent-tools-v1";
export const MAX_RECENT_TOOLS = 12;

function safeParse(raw: string | null): RecentToolEntry[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .filter(
        (x): x is RecentToolEntry =>
          typeof x === "object" &&
          x !== null &&
          typeof (x as RecentToolEntry).segment === "string" &&
          typeof (x as RecentToolEntry).navKey === "string" &&
          typeof (x as RecentToolEntry).at === "number"
      )
      .filter((x) => TOOL_SEGMENT_TO_NAV[x.segment] === x.navKey);
  } catch {
    return [];
  }
}

/** Pathname without locale prefix, e.g. `/pdf` or `/function-plot`. */
export function recordRecentToolFromPath(pathname: string): void {
  const trimmed = pathname.replace(/^\/+|\/+$/g, "");
  if (!trimmed) return;
  const segment = trimmed.split("/").filter(Boolean)[0];
  if (!segment) return;
  const navKey = TOOL_SEGMENT_TO_NAV[segment];
  if (!navKey) return;

  try {
    const prev = safeParse(localStorage.getItem(RECENT_TOOLS_KEY));
    const next: RecentToolEntry[] = [
      { segment, navKey, at: Date.now() },
      ...prev.filter((e) => e.segment !== segment),
    ].slice(0, MAX_RECENT_TOOLS);
    localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / private mode */
  }
}

export function readRecentTools(): RecentToolEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return safeParse(localStorage.getItem(RECENT_TOOLS_KEY)).sort(
      (a, b) => b.at - a.at
    );
  } catch {
    return [];
  }
}

export function clearRecentTools(): void {
  try {
    localStorage.removeItem(RECENT_TOOLS_KEY);
  } catch {
    /* ignore */
  }
}
