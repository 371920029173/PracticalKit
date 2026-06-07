"use client";

import { Link } from "@/i18n/navigation";
import {
  ACCENT_CLASSES,
  TOOL_ACCENT,
} from "@/lib/tool-accents";
import {
  clearRecentTools,
  readRecentTools,
  subscribeRecentTools,
  togglePinRecent,
  type RecentToolEntry,
} from "@/lib/recent-tools";
import { getSuggestedNavKeys } from "@/lib/tool-suggestions";
import { segmentFromNavKey } from "@/lib/tools-registry";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

function RecentChip({
  entry,
  onTogglePin,
}: {
  entry: RecentToolEntry;
  onTogglePin: (segment: string) => void;
}) {
  const nav = useTranslations("nav");
  const t = useTranslations("home");
  const accent = TOOL_ACCENT[entry.navKey] ?? "cyan";
  const styles = ACCENT_CLASSES[accent];

  return (
    <div className="group relative">
      <Link
        href={`/${entry.segment}/`}
        prefetch={false}
        className={`btn-motion inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-sm ${styles.icon} border-slate-200/80 dark:border-zinc-700/80`}
      >
        {entry.pinned ? <span aria-hidden>📌</span> : null}
        {nav(entry.navKey as never)}
      </Link>
      <button
        type="button"
        onClick={() => onTogglePin(entry.segment)}
        className="absolute -right-1 -top-1 hidden h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] shadow group-hover:flex dark:border-zinc-600 dark:bg-zinc-900"
        title={entry.pinned ? t("unpinTool") : t("pinTool")}
        aria-label={entry.pinned ? t("unpinTool") : t("pinTool")}
      >
        {entry.pinned ? "×" : "📌"}
      </button>
    </div>
  );
}

export function HomeContinuePanel() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");
  const [items, setItems] = useState<RecentToolEntry[]>([]);

  const refresh = useCallback(() => {
    setItems(readRecentTools());
  }, []);

  useEffect(() => {
    refresh();
    return subscribeRecentTools(refresh);
  }, [refresh]);

  const suggested = useMemo(
    () => getSuggestedNavKeys(items, { limit: 4 }),
    [items],
  );

  if (items.length === 0) {
    return (
      <section className="scroll-mt-24 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-6 dark:border-zinc-700 dark:bg-zinc-900/40">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{t("recentTitle")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-zinc-400">{t("recentEmpty")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {getSuggestedNavKeys([], { limit: 4 }).map((navKey) => (
            <Link
              key={navKey}
              href={`/${segmentFromNavKey(navKey)}/`}
              prefetch={false}
              className="btn-motion inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200"
            >
              {nav(navKey as never)}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="scroll-mt-24 space-y-4 rounded-[1.5rem] border border-indigo-200/60 bg-gradient-to-br from-indigo-50/90 via-white/80 to-violet-50/70 p-5 sm:p-6 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-zinc-950/60 dark:to-violet-950/30">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="section-kicker">{t("returnKicker")}</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{t("returnTitle")}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">{t("recentHint")}</p>
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
            <RecentChip entry={e} onTogglePin={(seg) => { togglePinRecent(seg); refresh(); }} />
          </li>
        ))}
      </ul>

      {suggested.length > 0 ? (
        <div className="rounded-2xl border border-white/60 bg-white/70 p-4 dark:border-zinc-700/60 dark:bg-zinc-900/50">
          <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{t("nextTitle")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggested.map((navKey) => (
              <Link
                key={navKey}
                href={`/${segmentFromNavKey(navKey)}/`}
                prefetch={false}
                className="btn-motion inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-200"
              >
                {nav(navKey as never)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
