"use client";

import { Link } from "@/i18n/navigation";
import {
  ACCENT_CLASSES,
  TOOL_ACCENT,
  type ToolAccent,
} from "@/lib/tool-accents";
import { useTranslations } from "next-intl";

type ToolTileProps = {
  href: string;
  navKey: string;
  title: string;
  blurb: string;
  isNew?: boolean;
  isRecent?: boolean;
};

function ToolIcon({ accent }: { accent: ToolAccent }) {
  return (
    <span
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${ACCENT_CLASSES[accent].icon}`}
      aria-hidden
    >
      ◈
    </span>
  );
}

export function ToolTile({ href, navKey, title, blurb, isNew, isRecent }: ToolTileProps) {
  const t = useTranslations("home");
  const accent = TOOL_ACCENT[navKey] ?? "cyan";
  const styles = ACCENT_CLASSES[accent];

  return (
    <Link
      href={href}
      prefetch={false}
      className={`tool-tile group ${styles.ring}`}
    >
      <div className={`tool-tile-glow bg-gradient-to-br ${styles.glow}`} />
      <div className="relative flex items-start gap-3">
        <ToolIcon accent={accent} />
        <div className="min-w-0 space-y-1.5">
          <span className="flex items-center gap-2 text-base font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-indigo-700 dark:text-white dark:group-hover:text-indigo-300">
            {title}
            {isRecent ? (
              <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                {t("recentBadge")}
              </span>
            ) : null}
            {isNew ? (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                NEW
              </span>
            ) : null}
          </span>
          <span className="block text-sm leading-relaxed text-slate-600 dark:text-zinc-400">
            {blurb}
          </span>
        </div>
      </div>
    </Link>
  );
}
