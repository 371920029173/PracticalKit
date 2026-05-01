"use client";

import { Link } from "@/i18n/navigation";
import {
  RECENT_TOOLS_KEY,
  clearRecentTools,
  readRecentTools,
  type RecentToolEntry,
} from "@/lib/recent-tools";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";

export function RecentToolsSection() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");
  const [items, setItems] = useState<RecentToolEntry[]>([]);
  const suggested = getSuggestions(items);

  const refresh = useCallback(() => {
    setItems(readRecentTools());
  }, []);

  useEffect(() => {
    refresh();
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === RECENT_TOOLS_KEY) refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  if (items.length === 0) {
    return (
      <section className="scroll-mt-24 space-y-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-6 dark:border-zinc-700 dark:bg-zinc-900/40">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {t("recentTitle")}
        </h2>
        <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
          {t("recentEmpty")}
        </p>
      </section>
    );
  }

  return (
    <section className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
            {t("recentTitle")}
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
            {t("recentHint")}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            clearRecentTools();
            setItems([]);
          }}
          className="btn-ghost text-sm text-slate-600 dark:text-zinc-400"
        >
          {t("recentClear")}
        </button>
      </div>
      <ul className="flex flex-wrap gap-2">
        {items.map((e) => (
          <li key={e.segment}>
            <Link
              href={`/${e.segment}/`}
              prefetch={false}
              className="btn-motion inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-900 shadow-sm hover:border-indigo-400 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-100 dark:hover:border-indigo-600 dark:hover:bg-indigo-900/40"
            >
              {nav(e.navKey as never)}
            </Link>
          </li>
        ))}
      </ul>
      {suggested.length > 0 ? (
        <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-zinc-700 dark:bg-zinc-900/50">
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
            {t("nextTitle")}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggested.map((navKey) => (
              <Link
                key={navKey}
                href={`/${segmentFromNavKey(navKey)}/`}
                prefetch={false}
                className="btn-motion inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
              >
                <span className="badge-new">{t("newBadge")}</span>
                <span>{nav(navKey as never)}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

const SUGGESTION_BY_NAV_KEY: Record<string, string[]> = {
  pdf: ["image", "textDiff"],
  image: ["color", "baseConvert"],
  data: ["jsonDiff", "apiSnippet"],
  regex: ["textDiff", "code"],
  textDiff: ["slug", "markdown"],
  baseConvert: ["hash", "code"],
};

function getSuggestions(items: RecentToolEntry[]): string[] {
  const first = items[0]?.navKey;
  if (!first) return [];
  return SUGGESTION_BY_NAV_KEY[first] ?? [];
}

function segmentFromNavKey(navKey: string): string {
  switch (navKey) {
    case "textDiff":
      return "text-diff";
    case "baseConvert":
      return "base-convert";
    case "jsonDiff":
      return "json-diff";
    case "apiSnippet":
      return "api-snippet";
    default:
      return navKey.toLowerCase();
  }
}
