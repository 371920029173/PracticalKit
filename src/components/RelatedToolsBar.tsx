"use client";

import { Link } from "@/i18n/navigation";
import { readRecentTools, subscribeRecentTools } from "@/lib/recent-tools";
import { getSuggestedNavKeys } from "@/lib/tool-suggestions";
import { TOOL_SEGMENT_TO_NAV, segmentFromNavKey } from "@/lib/tools-registry";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

export function RelatedToolsBar() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");
  const pathname = usePathname();
  const [recent, setRecent] = useState(readRecentTools);

  const refresh = useCallback(() => setRecent(readRecentTools()), []);
  useEffect(() => subscribeRecentTools(refresh), [refresh]);

  const currentSegment = useMemo(() => {
    const trimmed = pathname.replace(/^\/+|\/+$/g, "");
    const seg = trimmed.split("/").filter(Boolean)[0];
    if (!seg || !TOOL_SEGMENT_TO_NAV[seg]) return null;
    return seg;
  }, [pathname]);

  const currentNavKey = currentSegment ? TOOL_SEGMENT_TO_NAV[currentSegment] : null;

  const suggestions = useMemo(
    () =>
      getSuggestedNavKeys(recent, {
        limit: 4,
        excludeNavKey: currentNavKey ?? undefined,
      }),
    [recent, currentNavKey],
  );

  if (!currentSegment || suggestions.length === 0) return null;

  return (
    <section className="mt-10 border-t border-slate-200/80 pt-8 dark:border-zinc-700/80">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
        {t("relatedTitle")}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((navKey) => (
          <Link
            key={navKey}
            href={`/${segmentFromNavKey(navKey)}/`}
            prefetch={false}
            className="btn-motion inline-flex rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-200 dark:hover:border-indigo-700"
          >
            {nav(navKey as never)}
          </Link>
        ))}
      </div>
    </section>
  );
}
