import type { NavKey } from "@/lib/tools-registry";
import { TOOLS, type ToolCategory } from "@/lib/tools-registry";
import type { RecentToolEntry } from "@/lib/recent-tools";

const GRAPH: Partial<Record<NavKey, NavKey[]>> = {
  pdf: ["image", "textDiff", "slug"],
  image: ["color", "baseConvert", "qr"],
  data: ["jsonDiff", "apiSnippet", "csvJson"],
  text: ["textDiff", "slug", "markdown"],
  regex: ["textDiff", "code", "apiSnippet"],
  textDiff: ["slug", "markdown", "jsonDiff"],
  baseConvert: ["hash", "encoding", "code"],
  encoding: ["hash", "jwt", "apiSnippet"],
  hash: ["jwt", "encoding", "passwordAudit"],
  ipLookup: ["userAgent", "dnsLookup", "cidr"],
  userAgent: ["ipLookup", "dnsLookup", "mushroomQuiz"],
  dnsLookup: ["ipLookup", "cidr", "urlParser"],
  mushroomQuiz: ["userAgent", "hash", "ipLookup"],
  jsonDiff: ["data", "csvJson", "textDiff"],
  markdown: ["slug", "htmlEntities", "textDiff"],
  qr: ["urlParser", "slug", "image"],
  password: ["passwordAudit", "hash", "encoding"],
  passwordAudit: ["password", "hash", "encoding"],
  translate: ["text", "slug", "markdown"],
  money: ["units", "percentCalc", "time"],
  units: ["money", "percentCalc", "bmiCalc"],
  time: ["timezone", "cron", "countdown"],
  timezone: ["time", "cron", "countdown"],
  calc: ["functionPlot", "percentCalc", "units"],
  functionPlot: ["calc", "percentCalc", "baseConvert"],
  color: ["image", "cssMin", "htmlEntities"],
  csvJson: ["data", "jsonDiff", "apiSnippet"],
  jwt: ["hash", "apiSnippet", "encoding"],
  apiSnippet: ["httpStatus", "urlParser", "jwt"],
  httpStatus: ["apiSnippet", "urlParser", "dnsLookup"],
  urlParser: ["slug", "dnsLookup", "qr"],
  slug: ["urlParser", "htmlEntities", "markdown"],
  bmiCalc: ["percentCalc", "units", "calc"],
  percentCalc: ["calc", "units", "bmiCalc"],
  morse: ["encoding", "text", "unicode"],
  romanNumeral: ["baseConvert", "calc", "units"],
  luhnCheck: ["passwordAudit", "hash", "random"],
  countdown: ["time", "timezone", "cron"],
  cron: ["time", "timezone", "countdown"],
  random: ["password", "hash", "encoding"],
};

const CATEGORY_NEIGHBORS: Record<ToolCategory, NavKey[]> = {
  documents: ["pdf", "image", "textDiff"],
  media: ["image", "videoGif", "color"],
  dataDev: ["data", "jsonDiff", "textDiff"],
  daily: ["qr", "password", "units"],
  math: ["calc", "percentCalc", "units"],
  network: ["ipLookup", "dnsLookup", "userAgent"],
  fun: ["mushroomQuiz", "morse", "random"],
  extras: ["hash", "jwt", "cron"],
};

const STARTER: NavKey[] = ["pdf", "data", "hash", "qr", "ipLookup", "textDiff"];

export function getSuggestedNavKeys(
  recent: RecentToolEntry[],
  options?: { limit?: number; excludeNavKey?: string; excludeSegments?: string[] },
): NavKey[] {
  const limit = options?.limit ?? 4;
  const exclude = new Set<string>();
  if (options?.excludeNavKey) exclude.add(options.excludeNavKey);
  for (const seg of options?.excludeSegments ?? []) {
    const tool = TOOLS.find((t) => t.segment === seg);
    if (tool) exclude.add(tool.navKey);
  }
  for (const r of recent) exclude.add(r.navKey);

  const scores = new Map<NavKey, number>();

  const bump = (key: NavKey, weight: number) => {
    if (exclude.has(key)) return;
    scores.set(key, (scores.get(key) ?? 0) + weight);
  };

  for (const entry of recent.slice(0, 3)) {
    const visits = entry.visits ?? 1;
    for (const key of GRAPH[entry.navKey as NavKey] ?? []) bump(key, 12 * visits);
    const cat = TOOLS.find((t) => t.navKey === entry.navKey)?.category;
    if (cat) {
      for (const key of CATEGORY_NEIGHBORS[cat]) bump(key, 6);
    }
  }

  if (scores.size === 0) {
    for (const key of STARTER) bump(key, 1);
  }

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key]) => key);
}

export function sortToolsForHome<T extends { navKey: NavKey; segment: string }>(
  tools: T[],
  recent: RecentToolEntry[],
): T[] {
  const order = new Map<string, number>();
  recent.forEach((r, i) => {
    if (r.pinned) order.set(r.segment, -1000 + i);
    else order.set(r.segment, i);
  });

  return [...tools].sort((a, b) => {
    const ao = order.has(a.segment) ? order.get(a.segment)! : 999;
    const bo = order.has(b.segment) ? order.get(b.segment)! : 999;
    if (ao !== bo) return ao - bo;
    return a.navKey.localeCompare(b.navKey);
  });
}
