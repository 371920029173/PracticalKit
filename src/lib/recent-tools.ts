import { TOOL_SEGMENT_TO_NAV, segmentFromNavKey } from "@/lib/tools-registry";

export { TOOL_SEGMENT_TO_NAV, segmentFromNavKey };

export type RecentToolEntry = {
  segment: string;
  navKey: string;
  at: number;
  visits: number;
  pinned?: boolean;
};

export const RECENT_TOOLS_KEY = "pk-recent-tools-v2";
export const RECENT_TOOLS_LEGACY_KEY = "pk-recent-tools-v1";
export const RECENT_TOOLS_CHANGED = "pk-recent-tools-changed";
export const MAX_RECENT_TOOLS = 16;

function normalizeEntry(raw: Partial<RecentToolEntry>): RecentToolEntry | null {
  if (!raw.segment || !raw.navKey || typeof raw.at !== "number") return null;
  if (TOOL_SEGMENT_TO_NAV[raw.segment] !== raw.navKey) return null;
  return {
    segment: raw.segment,
    navKey: raw.navKey,
    at: raw.at,
    visits: typeof raw.visits === "number" && raw.visits > 0 ? raw.visits : 1,
    pinned: Boolean(raw.pinned),
  };
}

function safeParse(raw: string | null): RecentToolEntry[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    if (!Array.isArray(v)) return [];
    return v
      .map((x) => normalizeEntry(x as Partial<RecentToolEntry>))
      .filter((x): x is RecentToolEntry => x !== null);
  } catch {
    return [];
  }
}

function notifyChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(RECENT_TOOLS_CHANGED));
}

function migrateLegacy(): RecentToolEntry[] {
  try {
    const legacy = safeParse(localStorage.getItem(RECENT_TOOLS_LEGACY_KEY));
    if (legacy.length) {
      localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(legacy));
      localStorage.removeItem(RECENT_TOOLS_LEGACY_KEY);
    }
    return legacy;
  } catch {
    return [];
  }
}

function writeEntries(entries: RecentToolEntry[]) {
  localStorage.setItem(RECENT_TOOLS_KEY, JSON.stringify(entries));
  notifyChange();
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
    const prev = readRecentTools();
    const existing = prev.find((e) => e.segment === segment);
    const next: RecentToolEntry[] = [
      {
        segment,
        navKey,
        at: Date.now(),
        visits: (existing?.visits ?? 0) + 1,
        pinned: existing?.pinned,
      },
      ...prev.filter((e) => e.segment !== segment),
    ].slice(0, MAX_RECENT_TOOLS);
    writeEntries(next);
  } catch {
    /* ignore quota / private mode */
  }
}

export function readRecentTools(): RecentToolEntry[] {
  if (typeof window === "undefined") return [];
  try {
    let items = safeParse(localStorage.getItem(RECENT_TOOLS_KEY));
    if (!items.length) items = migrateLegacy();
    return items.sort((a, b) => {
      if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
      return b.at - a.at;
    });
  } catch {
    return [];
  }
}

export function clearRecentTools(): void {
  try {
    localStorage.removeItem(RECENT_TOOLS_KEY);
    notifyChange();
  } catch {
    /* ignore */
  }
}

export function togglePinRecent(segment: string): void {
  try {
    const items = readRecentTools();
    const next = items.map((e) =>
      e.segment === segment ? { ...e, pinned: !e.pinned } : e,
    );
    writeEntries(next);
  } catch {
    /* ignore */
  }
}

export function hasRecentHistory(): boolean {
  return readRecentTools().length > 0;
}

export function totalVisitCount(): number {
  return readRecentTools().reduce((sum, e) => sum + (e.visits ?? 1), 0);
}

export function subscribeRecentTools(onChange: () => void): () => void {
  const onCustom = () => onChange();
  const onStorage = (e: StorageEvent) => {
    if (e.key === RECENT_TOOLS_KEY || e.key === RECENT_TOOLS_LEGACY_KEY) onChange();
  };
  const onVis = () => {
    if (document.visibilityState === "visible") onChange();
  };
  window.addEventListener(RECENT_TOOLS_CHANGED, onCustom);
  window.addEventListener("storage", onStorage);
  document.addEventListener("visibilitychange", onVis);
  return () => {
    window.removeEventListener(RECENT_TOOLS_CHANGED, onCustom);
    window.removeEventListener("storage", onStorage);
    document.removeEventListener("visibilitychange", onVis);
  };
}
